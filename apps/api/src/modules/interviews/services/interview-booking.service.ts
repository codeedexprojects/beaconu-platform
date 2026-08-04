import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { InterviewBookingRepository } from "../repositories/interview-booking.repository";
import { InterviewSlotRepository } from "../repositories/interview-slot.repository";
import { ApplicationCourseService } from "@/modules/admissions/services/application-course.service";
import { ApplicationService } from "@/modules/admissions/services/application.service";
import { AttemptService } from "@/modules/assessments/services/attempt.service";
import { InterviewSlotService, mapSlot } from "./interview-slot.service";
import { InterviewSettingsService } from "./interview-settings.service";
import type {
  CompleteInterviewInput,
  InterviewBookingItem,
} from "@beaconu/types";

const READY_FOR_INTERVIEW_STATUSES = new Set([
  "submitted",
  "assessment_completed",
]);

type BookingRow = NonNullable<
  Awaited<ReturnType<typeof InterviewBookingRepository.findById>>
>;

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
    filters: {
      mode?: string;
      scheduledDate?: Date;
      dateFrom?: Date;
      dateTo?: Date;
      page: number;
      limit: number;
    },
  ) {
    const { rows, total } =
      await InterviewSlotRepository.listAvailableForCollege(collegeId, filters);
    return {
      data: rows.map(mapSlot),
      meta: PaginationHelper.createMeta(total, filters.page, filters.limit),
    };
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

    const alreadyAtInterviewStage = application.courses.some(
      (c) => c.status === "interview_pending",
    );
    if (!alreadyAtInterviewStage) {
      if (application.formStatus !== "submitted") {
        throw new ConflictError(
          "This application is not currently at the interview stage",
        );
      }
      if (application.assessmentRequired) {
        const attempt = await AttemptService.findStatusForApplication(
          studentId,
          data.application_id,
        );
        if (attempt?.status !== "result_published") {
          throw new ConflictError(
            "This application's assessment must be completed before booking an interview",
          );
        }
      }
    }

    const existing = await InterviewBookingRepository.findByApplicationId(
      data.application_id,
    );
    if (existing) {
      throw new ConflictError(
        "You already have an interview booking for this application",
      );
    }

    const activeElsewhere =
      await InterviewBookingRepository.findActiveByStudent(studentId);
    if (activeElsewhere) {
      throw new ConflictError(
        "You already have an active interview booking. Cancel it before booking another.",
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

    await Promise.all(
      application.courses
        .filter((c) => READY_FOR_INTERVIEW_STATUSES.has(c.status))
        .map((c) =>
          ApplicationCourseService.markInterviewPending(
            c.applicationCourseId,
            studentId,
          ),
        ),
    );

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
