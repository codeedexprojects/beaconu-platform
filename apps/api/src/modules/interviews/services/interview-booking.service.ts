import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { InterviewBookingRepository } from "../repositories/interview-booking.repository";
import { InterviewSlotRepository } from "../repositories/interview-slot.repository";
import { ApplicationCourseService } from "@/modules/admissions/services/application-course.service";
import { ApplicationService } from "@/modules/admissions/services/application.service";
import { InterviewSlotService, mapSlot } from "./interview-slot.service";
import { InterviewSettingsService } from "./interview-settings.service";
import type {
  CompleteInterviewInput,
  InterviewBookingItem,
} from "@beaconu/types";

// A course is eligible for the shared interview once its assessment stage
// is done, or if it's already at interview_pending (re-booking after a
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
    applicationId: row.applicationId,
    applicationNumber: row.application.applicationNumber,
    courses: row.application.applicationCourses.map((ac) => ({
      applicationCourseId: ac.id,
      courseName: ac.course.name,
      status: ac.status,
    })),
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
    data: { application_id: string; slot_id: string },
  ) {
    const application =
      await ApplicationService.getForStudentWithCourseStatuses(
        data.application_id,
        studentId,
      );
    if (!application.courses.some((c) => BOOKABLE_STATUSES.has(c.status))) {
      throw new ConflictError(
        "This application is not currently at the interview stage",
      );
    }

    const existing = await InterviewBookingRepository.findByApplicationId(
      data.application_id,
    );
    if (existing) {
      throw new ConflictError(
        "You already have an interview booking for this application",
      );
    }

    const slot = await InterviewSlotRepository.findById(data.slot_id);
    if (
      !slot ||
      slot.collegeId !== application.collegeId ||
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
        applicationId: data.application_id,
        studentId,
        slotId: data.slot_id,
      });
    });

    // Advance every course that was actually eligible (assessment_completed
    // → interview_pending) — courses not yet at that stage are left alone,
    // and markInterviewPending is a no-op for ones already there (e.g. a
    // re-booking after cancellation).
    await Promise.all(
      application.courses
        .filter((c) => BOOKABLE_STATUSES.has(c.status))
        .map((c) =>
          ApplicationCourseService.markInterviewPending(
            c.applicationCourseId,
            studentId,
          ),
        ),
    );

    // First booking against this slot is what actually creates the
    // Google Meet event — see InterviewSlotService.ensureMeetEvent's doc
    // comment. A second student booking the same shared slot just reuses
    // the link already created (no-op inside ensureMeetEvent).
    await InterviewSlotService.ensureMeetEvent(slot);

    const finalBooking = await InterviewBookingRepository.findById(booking.id);
    return mapBooking(finalBooking!);
  }

  static async getMine(studentId: string, applicationId: string) {
    const booking =
      await InterviewBookingRepository.findByApplicationId(applicationId);
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

    // Advance every course still awaiting this outcome — courses not at
    // interview_pending (e.g. never eligible in the first place) are left
    // untouched.
    const application =
      await ApplicationService.getForCollegeWithCourseStatuses(
        booking.applicationId,
        collegeId,
      );
    await Promise.all(
      application.courses
        .filter((c) => c.status === "interview_pending")
        .map((c) =>
          ApplicationCourseService.markInterviewCompleted(
            c.applicationCourseId,
            staffId,
          ),
        ),
    );

    return mapBooking(updated);
  }
}
