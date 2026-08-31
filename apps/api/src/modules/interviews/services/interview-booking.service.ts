import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors";
import { logger } from "@/shared/lib/logger";
import {
  createMeetEvent,
  updateMeetEventTime,
  deleteMeetEvent,
  isGoogleMeetReady,
} from "@/shared/lib/google-meet";
import { ApplicationService } from "@/modules/admissions/services/application.service";
import { ApplicationCourseService } from "@/modules/admissions/services/application-course.service";
import {
  InterviewBookingRepository,
  type ScheduleBookingData,
} from "../repositories/interview-booking.repository";
import {
  formatDateOnly,
  formatTimeOnly,
  parseDateOnly,
  parseTimeOnly,
  combineDateAndTime,
} from "../lib/datetime";
import type {
  CompleteInterviewInput,
  InterviewBookingItem,
  PanelAvailabilityQuery,
  PanelMemberAvailabilityItem,
  PendingInterviewItem,
  ScheduleInterviewInput,
} from "@beaconu/types";

type BookingRow = NonNullable<
  Awaited<ReturnType<typeof InterviewBookingRepository.findById>>
>;

function mapBooking(row: BookingRow): InterviewBookingItem {
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
    studentEmail: row.student.email,
    studentPhone: row.student.phoneNumber,
    studentPhotoUrl: row.application.profilePhotoUrl,
    status: row.status as InterviewBookingItem["status"],
    mode: row.mode as InterviewBookingItem["mode"],
    scheduledDate: row.scheduledDate ? formatDateOnly(row.scheduledDate) : null,
    startTime: row.startTime ? formatTimeOnly(row.startTime) : null,
    endTime: row.endTime ? formatTimeOnly(row.endTime) : null,
    panelMemberId: row.panelMemberId,
    panelMemberName: row.panelMember?.fullName ?? null,
    panelMemberRole: row.panelMember?.collegeRole.name ?? null,
    meetingUrl: row.meetingUrl,
    meetingId: row.meetingId,
    venue: row.venue,
    interviewScore: row.interviewScore ? row.interviewScore.toString() : null,
    interviewRemarks: row.interviewRemarks,
    interviewOutcome:
      row.interviewOutcome as InterviewBookingItem["interviewOutcome"],
    evaluatedBy: row.evaluatedBy,
    evaluatedAt: row.evaluatedAt ? row.evaluatedAt.toISOString() : null,
    scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : null,
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

function toNaiveISODateTime(date: Date, time: Date): string {
  const datePart = date.toISOString().slice(0, 10);
  const timePart = time.toISOString().slice(11, 19);
  return `${datePart}T${timePart}`;
}

export class InterviewBookingService {
  private static async loadForCollege(id: string, collegeId: string) {
    const booking = await InterviewBookingRepository.findByIdForCollege(
      id,
      collegeId,
    );
    if (!booking) throw new NotFoundError("Interview booking not found");
    return booking;
  }

  static async getPanelAvailability(
    collegeId: string,
    data: PanelAvailabilityQuery,
  ): Promise<PanelMemberAvailabilityItem[]> {
    const scheduledDate = parseDateOnly(data.scheduled_date);
    const startTime = parseTimeOnly(data.start_time);
    const endTime = parseTimeOnly(data.end_time);
    if (endTime.getTime() <= startTime.getTime()) {
      throw new ValidationError("end_time must be after start_time");
    }

    const staff = await InterviewBookingRepository.findStaffForCollege(
      collegeId,
      data.search,
    );
    const busyRows =
      await InterviewBookingRepository.findScheduledOverlapsForStaff(
        staff.map((s) => s.id),
        scheduledDate,
        startTime,
        endTime,
        data.exclude_booking_id,
      );
    const busyIds = new Set(busyRows.map((r) => r.panelMemberId));

    return staff.map((s) => ({
      id: s.id,
      name: s.fullName,
      roleName: s.collegeRole?.name ?? null,
      avatarUrl: s.avatarUrl,
      isAvailable: !busyIds.has(s.id),
    }));
  }

  static async listPending(
    collegeId: string,
    filters: { search?: string } = {},
  ): Promise<PendingInterviewItem[]> {
    return ApplicationService.listInterviewEligible(collegeId, filters);
  }

  static async listForCollege(
    collegeId: string,
    filters: { status?: string; search?: string } = {},
  ): Promise<InterviewBookingItem[]> {
    const rows = await InterviewBookingRepository.listForCollege(
      collegeId,
      filters,
    );
    return rows.map(mapBooking);
  }

  static async getBooking(
    collegeId: string,
    bookingId: string,
  ): Promise<InterviewBookingItem> {
    const row = await this.loadForCollege(bookingId, collegeId);
    return mapBooking(row);
  }

  /** Applicant context for the scheduling screen — works for both a
   * still-pending candidate (no `InterviewBooking` row yet, `booking:
   * null`) and one being re-scheduled (`booking` populated, used to
   * pre-fill the form). */
  static async getApplicationDetail(collegeId: string, applicationId: string) {
    const application =
      await ApplicationService.getForCollegeWithCourseStatuses(
        applicationId,
        collegeId,
      );
    const bookingRow =
      await InterviewBookingRepository.findByApplicationId(applicationId);
    const booking =
      bookingRow && bookingRow.collegeId === collegeId
        ? mapBooking(bookingRow)
        : null;

    return {
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
      studentId: application.studentId,
      studentName: application.studentName,
      studentEmail: application.studentEmail,
      studentPhone: application.studentPhone,
      studentPhotoUrl: application.studentPhotoUrl,
      courses: application.courses,
      booking,
    };
  }

  /** Best-effort: creates the Google Calendar/Meet event the first time a
   * "gmeet" booking is scheduled, or syncs an existing event's time on a
   * re-schedule. Idempotent, never throws — scheduling must succeed even
   * if Calendar/Meet is unavailable. */
  private static async syncMeetEvent(row: BookingRow): Promise<void> {
    if (row.mode !== "gmeet" || !isGoogleMeetReady()) return;
    if (!row.scheduledDate || !row.startTime || !row.endTime) return;

    try {
      const startDateTime = toNaiveISODateTime(
        row.scheduledDate,
        row.startTime,
      );
      const endDateTime = toNaiveISODateTime(row.scheduledDate, row.endTime);

      if (row.googleEventId) {
        await updateMeetEventTime(
          row.googleEventId,
          startDateTime,
          endDateTime,
        );
        return;
      }

      const attendeeEmails = Array.from(
        new Set(
          [row.student.email, row.panelMember?.email].filter(
            (email): email is string => !!email,
          ),
        ),
      );
      const meetEvent = await createMeetEvent({
        summary: row.panelMember?.fullName
          ? `Interview with ${row.panelMember.fullName}`
          : "Candidate Interview",
        startDateTime,
        endDateTime,
        attendeeEmails,
      });
      if (!meetEvent) return;

      await InterviewBookingRepository.updateMeetingInfo(row.id, {
        meetingUrl: meetEvent.meetingUrl,
        meetingId: meetEvent.meetingId,
        googleEventId: meetEvent.eventId,
      });
    } catch (error) {
      logger.error(
        { err: error, bookingId: row.id },
        "Failed to sync Google Meet event for interview booking",
      );
    }
  }

  /** Keyed by applicationId, not bookingId — works identically whether
   * this is the first time a candidate is scheduled (no row exists yet)
   * or an already-scheduled/cancelled booking is being moved, i.e. this
   * is also the reschedule action. See Plan AD Design Decision #3/#7. */
  static async schedule(
    collegeId: string,
    staffId: string,
    applicationId: string,
    data: ScheduleInterviewInput,
  ): Promise<InterviewBookingItem> {
    if (data.mode === "on_campus" && !data.venue) {
      throw new ValidationError("venue is required for on_campus interviews");
    }

    const existingRow =
      await InterviewBookingRepository.findByApplicationId(applicationId);
    const existing =
      existingRow && existingRow.collegeId === collegeId ? existingRow : null;
    if (existing && existing.status === "completed") {
      throw new ConflictError("This interview has already been completed");
    }

    const staff =
      await InterviewBookingRepository.findStaffForCollege(collegeId);
    const panelMember = staff.find((s) => s.id === data.panel_member_id);
    if (!panelMember) throw new NotFoundError("Panel member not found");

    const scheduledDate = parseDateOnly(data.scheduled_date);
    const startTime = parseTimeOnly(data.start_time);
    const endTime = parseTimeOnly(data.end_time);
    if (endTime.getTime() <= startTime.getTime()) {
      throw new ValidationError("end_time must be after start_time");
    }
    if (combineDateAndTime(scheduledDate, startTime).getTime() <= Date.now()) {
      throw new ValidationError("Interviews cannot be scheduled in the past");
    }

    const busyRows =
      await InterviewBookingRepository.findScheduledOverlapsForStaff(
        [data.panel_member_id],
        scheduledDate,
        startTime,
        endTime,
        existing?.id,
      );
    if (busyRows.length > 0) {
      throw new ConflictError(
        "This panel member already has another interview scheduled at that time",
      );
    }

    const application = existing
      ? { studentId: existing.studentId }
      : await ApplicationService.getForCollegeWithCourseStatuses(
          applicationId,
          collegeId,
        );

    const scheduleData: ScheduleBookingData = {
      mode: data.mode,
      scheduledDate,
      startTime,
      endTime,
      panelMemberId: data.panel_member_id,
      venue: data.venue ?? null,
      scheduledBy: staffId,
    };

    const row = await InterviewBookingRepository.schedule(
      applicationId,
      application.studentId,
      collegeId,
      scheduleData,
    );

    await this.syncMeetEvent(row);

    const final = await InterviewBookingRepository.findById(row.id);
    return mapBooking(final!);
  }

  static async completeInterview(
    collegeId: string,
    staffId: string,
    bookingId: string,
    data: CompleteInterviewInput,
  ): Promise<InterviewBookingItem> {
    const booking = await this.loadForCollege(bookingId, collegeId);
    if (booking.status !== "scheduled") {
      throw new ConflictError("This interview is not currently scheduled");
    }

    const updated = await InterviewBookingRepository.recordOutcome(bookingId, {
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

  static async cancel(
    collegeId: string,
    bookingId: string,
  ): Promise<InterviewBookingItem> {
    const booking = await this.loadForCollege(bookingId, collegeId);
    if (booking.status === "completed") {
      throw new ConflictError("A completed interview cannot be cancelled");
    }
    if (booking.status === "cancelled") {
      throw new ConflictError("This interview is already cancelled");
    }

    if (booking.googleEventId) {
      try {
        await deleteMeetEvent(booking.googleEventId);
      } catch (error) {
        logger.error(
          { err: error, bookingId },
          "Failed to delete Google Meet event on interview cancel",
        );
      }
    }

    const updated = await InterviewBookingRepository.setStatus(
      bookingId,
      "cancelled",
    );
    return mapBooking(updated);
  }

  static async getMine(
    studentId: string,
    applicationId: string,
  ): Promise<InterviewBookingItem> {
    const booking =
      await InterviewBookingRepository.findByApplicationIdForStudent(
        applicationId,
        studentId,
      );
    if (!booking) throw new NotFoundError("Interview booking not found");
    return mapBooking(booking);
  }
}
