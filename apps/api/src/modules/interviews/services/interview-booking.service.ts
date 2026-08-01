import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { InterviewBookingRepository } from "../repositories/interview-booking.repository";
import { InterviewSlotRepository } from "../repositories/interview-slot.repository";
import { ApplicationCourseService } from "@/modules/admissions/services/application-course.service";
import { InterviewSlotService, mapSlot } from "./interview-slot.service";
import { InterviewSettingsService } from "./interview-settings.service";
import type {
  CompleteInterviewInput,
  InterviewBookingItem,
} from "@beaconu/types";

// A course is eligible to book an interview once its assessment stage is
// done, or if it's already at interview_pending (re-booking after a
// cancelled booking) — forward-compatible with whatever review stage
// precedes this, same reasoning as AttemptService.start()'s course-status
// gate in the assessments module.
const BOOKABLE_STATUSES = new Set([
  "assessment_completed",
  "interview_pending",
]);

type BookingRow = NonNullable<
  Awaited<ReturnType<typeof InterviewBookingRepository.findById>>
>;

// "Get my booking" is meant to be fully self-contained (no separate
// settings call needed post-booking) — bakes in whichever mode-specific
// instructions block matches the booked slot's mode.
async function mapBooking(row: BookingRow): Promise<InterviewBookingItem> {
  const settings = await InterviewSettingsService.get(row.slot.collegeId);
  const instructions =
    row.slot.mode === "gmeet" ? settings.gmeet : settings.onCampus;
  return {
    id: row.id,
    applicationCourseId: row.applicationCourseId,
    studentId: row.studentId,
    studentName: row.student.fullName,
    studentPhone: row.student.phoneNumber,
    slot: mapSlot(row.slot),
    instructions,
    status: row.status as InterviewBookingItem["status"],
    interviewScore: row.interviewScore ? row.interviewScore.toString() : null,
    interviewRemarks: row.interviewRemarks,
    interviewOutcome:
      row.interviewOutcome as InterviewBookingItem["interviewOutcome"],
    evaluatedBy: row.evaluatedBy,
    evaluatedAt: row.evaluatedAt ? row.evaluatedAt.toISOString() : null,
    bookedAt: row.bookedAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
  };
}

export class InterviewBookingService {
  static async listAvailableSlots(
    collegeId: string,
    mode?: string,
    scheduledDate?: Date,
  ) {
    const rows = await InterviewSlotRepository.listAvailableForCollege(
      collegeId,
      mode,
      scheduledDate,
    );
    return rows.map(mapSlot);
  }

  static async bookSlot(
    studentId: string,
    data: { application_course_id: string; slot_id: string },
  ) {
    const course = await ApplicationCourseService.getForStudentWithStatus(
      data.application_course_id,
      studentId,
    );
    if (!BOOKABLE_STATUSES.has(course.status)) {
      throw new ConflictError(
        "This course is not currently at the interview stage",
      );
    }

    const existing = await InterviewBookingRepository.findByApplicationCourseId(
      data.application_course_id,
    );
    if (existing) {
      throw new ConflictError(
        "You already have an interview booking for this course",
      );
    }

    const slot = await InterviewSlotRepository.findById(data.slot_id);
    if (
      !slot ||
      slot.collegeId !== course.collegeId ||
      slot.status !== "active"
    ) {
      throw new NotFoundError("Interview slot not found");
    }

    const booking = await prisma.$transaction(async (tx) => {
      const claimed = await InterviewSlotRepository.incrementBooked(
        tx,
        data.slot_id,
      );
      if (!claimed) {
        throw new ConflictError("This interview slot is fully booked");
      }
      return InterviewBookingRepository.create(tx, {
        applicationCourseId: data.application_course_id,
        studentId,
        slotId: data.slot_id,
      });
    });

    await ApplicationCourseService.markInterviewPending(
      data.application_course_id,
      studentId,
    );

    // First booking against this slot is what actually creates the
    // Google Meet event — see InterviewSlotService.ensureMeetEvent's doc
    // comment. A second student booking the same shared slot just reuses
    // the link already created (no-op inside ensureMeetEvent).
    await InterviewSlotService.ensureMeetEvent(slot);

    const finalBooking = await InterviewBookingRepository.findById(booking.id);
    return mapBooking(finalBooking!);
  }

  static async getMine(studentId: string, applicationCourseId: string) {
    const booking =
      await InterviewBookingRepository.findByApplicationCourseId(
        applicationCourseId,
      );
    if (!booking || booking.studentId !== studentId) {
      throw new NotFoundError("Interview booking not found");
    }
    return mapBooking(booking);
  }

  static async cancelMine(studentId: string, bookingId: string) {
    const booking = await InterviewBookingRepository.findByIdForStudent(
      bookingId,
      studentId,
    );
    if (!booking) throw new NotFoundError("Interview booking not found");
    if (booking.status !== "booked") {
      throw new ConflictError("This booking is not currently active");
    }

    await prisma.$transaction(async (tx) => {
      await InterviewSlotRepository.decrementBooked(tx, booking.slotId);
      await InterviewBookingRepository.setStatus(bookingId, "cancelled");
    });

    const updated = await InterviewBookingRepository.findById(bookingId);
    return mapBooking(updated!);
  }

  static async listForCollege(collegeId: string, status?: string) {
    const rows = await InterviewBookingRepository.listForCollege(collegeId, {
      status,
    });
    return Promise.all(rows.map(mapBooking));
  }

  private static async loadForCollege(id: string, collegeId: string) {
    const booking = await InterviewBookingRepository.findById(id);
    if (!booking || booking.slot.collegeId !== collegeId) {
      throw new NotFoundError("Interview booking not found");
    }
    return booking;
  }

  static async completeInterview(
    collegeId: string,
    staffId: string,
    bookingId: string,
    data: CompleteInterviewInput,
  ) {
    const booking = await this.loadForCollege(bookingId, collegeId);
    if (booking.status !== "booked") {
      throw new ConflictError("This booking is not currently active");
    }

    const updated = await InterviewBookingRepository.recordOutcome(bookingId, {
      status: "completed",
      interviewScore: data.interview_score,
      interviewOutcome: data.interview_outcome,
      interviewRemarks: data.interview_remarks,
      evaluatedBy: staffId,
    });

    await ApplicationCourseService.markInterviewCompleted(
      booking.applicationCourseId,
      staffId,
    );

    return mapBooking(updated);
  }
}
