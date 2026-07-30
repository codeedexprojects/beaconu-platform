import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors";
import { InterviewRescheduleRepository } from "../repositories/interview-reschedule.repository";
import { InterviewBookingRepository } from "../repositories/interview-booking.repository";
import { InterviewSlotRepository } from "../repositories/interview-slot.repository";
import type {
  InterviewRescheduleItem,
  ReviewInterviewRescheduleInput,
} from "@beaconu/types";

const RESCHEDULE_CUTOFF_MS = 30 * 60 * 1000;

type RescheduleRow = NonNullable<
  Awaited<ReturnType<typeof InterviewRescheduleRepository.findById>>
>;

function mapReschedule(row: RescheduleRow): InterviewRescheduleItem {
  return {
    id: row.id,
    bookingId: row.bookingId,
    studentId: row.studentId,
    fromSlotId: row.fromSlotId,
    toSlotId: row.toSlotId,
    reason: row.reason,
    status: row.status as InterviewRescheduleItem["status"],
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
    reviewRemarks: row.reviewRemarks,
    createdAt: row.createdAt.toISOString(),
  };
}

/** `scheduledDate` (@db.Date) and `startTime` (@db.Time) are separate
 * columns — Prisma returns startTime as an epoch-date Date with only the
 * time-of-day meaningful. Combine into the slot's real start instant. */
function slotStartInstant(scheduledDate: Date, startTime: Date): Date {
  const combined = new Date(scheduledDate);
  combined.setUTCHours(
    startTime.getUTCHours(),
    startTime.getUTCMinutes(),
    startTime.getUTCSeconds(),
    0,
  );
  return combined;
}

export class InterviewRescheduleService {
  static async request(
    studentId: string,
    bookingId: string,
    data: { to_slot_id?: string; reason: string },
  ) {
    const booking = await InterviewBookingRepository.findByIdForStudent(
      bookingId,
      studentId,
    );
    if (!booking) throw new NotFoundError("Interview booking not found");
    if (booking.status !== "booked") {
      throw new ConflictError("This booking is not currently active");
    }

    const alreadyRequested =
      await InterviewRescheduleRepository.countNonRejectedForBooking(bookingId);
    if (alreadyRequested > 0) {
      throw new ConflictError(
        "You've already requested a reschedule for this interview",
      );
    }

    const slotStart = slotStartInstant(
      booking.slot.scheduledDate,
      booking.slot.startTime,
    );
    if (Date.now() > slotStart.getTime() - RESCHEDULE_CUTOFF_MS) {
      throw new ConflictError(
        "Reschedule requests must be submitted at least 30 minutes before the interview",
      );
    }

    if (data.to_slot_id) {
      const toSlot = await InterviewSlotRepository.findById(data.to_slot_id);
      if (
        !toSlot ||
        toSlot.collegeId !== booking.slot.collegeId ||
        toSlot.status !== "active"
      ) {
        throw new ValidationError("Requested slot is not available");
      }
    }

    const created = await InterviewRescheduleRepository.create({
      bookingId,
      studentId,
      fromSlotId: booking.slotId,
      toSlotId: data.to_slot_id,
      reason: data.reason,
    });
    return mapReschedule(created);
  }

  static async listForCollege(collegeId: string, status?: string) {
    const rows = await InterviewRescheduleRepository.listForCollege(collegeId, {
      status,
    });
    return rows.map(mapReschedule);
  }

  static async review(
    collegeId: string,
    staffId: string,
    rescheduleId: string,
    data: ReviewInterviewRescheduleInput,
  ) {
    const reschedule =
      await InterviewRescheduleRepository.findById(rescheduleId);
    if (!reschedule) throw new NotFoundError("Reschedule request not found");
    if (reschedule.status !== "pending") {
      throw new ConflictError(
        "This reschedule request has already been reviewed",
      );
    }

    const booking = await InterviewBookingRepository.findById(
      reschedule.bookingId,
    );
    if (!booking || booking.slot.collegeId !== collegeId) {
      throw new NotFoundError("Reschedule request not found");
    }

    if (data.action === "reject") {
      const rejected = await InterviewRescheduleRepository.updateReview(
        prisma,
        rescheduleId,
        {
          status: "rejected",
          reviewedBy: staffId,
          reviewRemarks: data.review_remarks,
        },
      );
      return mapReschedule(rejected);
    }

    const toSlotId = data.to_slot_id ?? reschedule.toSlotId;
    if (!toSlotId) {
      throw new ValidationError(
        "to_slot_id is required to approve this reschedule",
      );
    }
    const toSlot = await InterviewSlotRepository.findById(toSlotId);
    if (
      !toSlot ||
      toSlot.collegeId !== collegeId ||
      toSlot.status !== "active"
    ) {
      throw new NotFoundError("Interview slot not found");
    }

    const approved = await prisma.$transaction(async (tx) => {
      const claimed = await InterviewSlotRepository.incrementBooked(
        tx,
        toSlotId,
      );
      if (!claimed) {
        throw new ConflictError("The requested slot is fully booked");
      }
      await InterviewSlotRepository.decrementBooked(tx, booking.slotId);
      await InterviewBookingRepository.updateSlot(tx, booking.id, toSlotId);
      return InterviewRescheduleRepository.updateReview(tx, rescheduleId, {
        status: "approved",
        toSlotId,
        reviewedBy: staffId,
        reviewRemarks: data.review_remarks,
      });
    });
    return mapReschedule(approved);
  }
}
