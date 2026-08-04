import { NotFoundError, ValidationError } from "@/shared/errors";
import { logger } from "@/shared/lib/logger";
import {
  createMeetEvent,
  updateMeetEventTime,
  deleteMeetEvent,
  isGoogleMeetReady,
} from "@/shared/lib/google-meet";
import {
  InterviewSlotRepository,
  type InterviewSlotCreateData,
} from "../repositories/interview-slot.repository";
import { InterviewSettingsService } from "./interview-settings.service";
import {
  formatDateOnly,
  formatTimeOnly,
  combineDateAndTime,
} from "../lib/datetime";
import type { InterviewSlotItem } from "@beaconu/types";

type SlotRow = NonNullable<
  Awaited<ReturnType<typeof InterviewSlotRepository.findById>>
>;

export function mapSlot(row: SlotRow): InterviewSlotItem {
  return {
    id: row.id,
    collegeId: row.collegeId,
    mode: row.mode as InterviewSlotItem["mode"],
    scheduledDate: formatDateOnly(row.scheduledDate),
    startTime: formatTimeOnly(row.startTime),
    endTime: formatTimeOnly(row.endTime),
    durationMins: row.durationMins,
    maxCapacity: row.maxCapacity,
    bookedCount: row.bookedCount,
    meetingUrl: row.zoomMeetingUrl,
    meetingId: row.zoomMeetingId,
    meetingPasscode: row.zoomPasscode,
    campus: row.campus
      ? {
          id: row.campus.id,
          name: row.campus.name,
          address: row.campus.address,
          city: row.campus.city,
          state: row.campus.state,
          pinCode: row.campus.pinCode,
          latitude: row.campus.latitude ? row.campus.latitude.toNumber() : null,
          longitude: row.campus.longitude
            ? row.campus.longitude.toNumber()
            : null,
        }
      : null,
    venue: row.venue,
    interviewerId: row.interviewerId,
    interviewerName: row.interviewer?.fullName ?? null,
    status: row.status as InterviewSlotItem["status"],
    createdAt: row.createdAt.toISOString(),
  };
}

function toNaiveISODateTime(date: Date, time: Date): string {
  const datePart = date.toISOString().slice(0, 10);
  const timePart = time.toISOString().slice(11, 19);
  return `${datePart}T${timePart}`;
}

export class InterviewSlotService {
  private static validateTimes(start: Date, end: Date) {
    if (end.getTime() <= start.getTime()) {
      throw new ValidationError("end_time must be after start_time");
    }
  }

  private static validateNotInPast(scheduledDate: Date, startTime: Date) {
    const slotStart = combineDateAndTime(scheduledDate, startTime);
    if (slotStart.getTime() <= Date.now()) {
      throw new ValidationError(
        "Interview slots cannot be scheduled in the past",
      );
    }
  }

  /** Best-effort: creates the Google Calendar/Meet event for a "gmeet"
   * slot the first time it's actually needed — i.e. when a student books
   * it, not when the slot is first created (a slot can sit unbooked
   * indefinitely; no reason to create a calendar event for it yet).
   * Idempotent — a no-op if the slot already has one (e.g. a second
   * student booking the same shared slot just reuses the existing link).
   * Never throws — booking must succeed even if Calendar/Meet is
   * unavailable. Called from interview-booking.service.ts. */
  static async ensureMeetEvent(row: SlotRow): Promise<void> {
    if (row.mode !== "gmeet" || !isGoogleMeetReady() || row.googleEventId) {
      return;
    }

    try {
      const attendeeEmails = row.interviewer?.email
        ? [row.interviewer.email]
        : [];

      const meetEvent = await createMeetEvent({
        summary: row.interviewer?.fullName
          ? `Interview with ${row.interviewer.fullName}`
          : "Candidate Interview",
        startDateTime: toNaiveISODateTime(row.scheduledDate, row.startTime),
        endDateTime: toNaiveISODateTime(row.scheduledDate, row.endTime),
        attendeeEmails,
      });
      if (!meetEvent) return;

      await InterviewSlotRepository.updateMeetingInfo(row.id, {
        meetingUrl: meetEvent.meetingUrl,
        meetingId: meetEvent.meetingId,
        googleEventId: meetEvent.eventId,
      });
    } catch (error) {
      logger.error(
        { err: error, slotId: row.id },
        "Failed to create Google Meet event for interview slot",
      );
    }
  }

  /** Best-effort: keeps an already-existing Calendar event's time in sync
   * when a college-admin edits a "gmeet" slot's date/time — never
   * *creates* one (that only happens at booking time, see
   * ensureMeetEvent). A no-op for slots nobody's booked yet. */
  private static async syncMeetEventTime(row: SlotRow): Promise<void> {
    if (row.mode !== "gmeet" || !isGoogleMeetReady() || !row.googleEventId) {
      return;
    }
    await updateMeetEventTime(
      row.googleEventId,
      toNaiveISODateTime(row.scheduledDate, row.startTime),
      toNaiveISODateTime(row.scheduledDate, row.endTime),
    );
  }

  private static async validateCampus(collegeId: string, campusId?: string) {
    if (!campusId) return;
    const campus = await InterviewSlotRepository.findCampusInCollege(
      campusId,
      collegeId,
    );
    if (!campus) throw new NotFoundError("Campus not found");
  }

  static async create(collegeId: string, data: InterviewSlotCreateData) {
    await InterviewSettingsService.assertModeAllowed(collegeId, data.mode);
    await this.validateCampus(collegeId, data.campusId);
    this.validateTimes(data.startTime, data.endTime);
    this.validateNotInPast(data.scheduledDate, data.startTime);
    const row = await InterviewSlotRepository.create(collegeId, data);
    return mapSlot(row);
  }

  static async list(
    collegeId: string,
    filters: { mode?: string; status?: string },
  ) {
    const rows = await InterviewSlotRepository.listByCollege(
      collegeId,
      filters,
    );
    return rows.map(mapSlot);
  }

  static async listAvailable(
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

  private static async loadForCollege(id: string, collegeId: string) {
    const slot = await InterviewSlotRepository.findById(id);
    if (!slot || slot.collegeId !== collegeId) {
      throw new NotFoundError("Interview slot not found");
    }
    return slot;
  }

  static async update(
    collegeId: string,
    id: string,
    data: Partial<InterviewSlotCreateData>,
  ) {
    const existing = await this.loadForCollege(id, collegeId);
    if (data.mode !== undefined && data.mode !== existing.mode) {
      await InterviewSettingsService.assertModeAllowed(collegeId, data.mode);
    }
    if (data.campusId !== undefined) {
      await this.validateCampus(collegeId, data.campusId);
    }
    const start = data.startTime ?? existing.startTime;
    const end = data.endTime ?? existing.endTime;
    if (data.startTime !== undefined || data.endTime !== undefined) {
      this.validateTimes(start, end);
    }
    if (data.scheduledDate !== undefined || data.startTime !== undefined) {
      const scheduledDate = data.scheduledDate ?? existing.scheduledDate;
      this.validateNotInPast(scheduledDate, start);
    }
    const updated = await InterviewSlotRepository.update(id, data);
    if (
      data.scheduledDate !== undefined ||
      data.startTime !== undefined ||
      data.endTime !== undefined
    ) {
      await this.syncMeetEventTime(updated);
    }
    return mapSlot(updated);
  }

  static async cancel(collegeId: string, id: string) {
    const slot = await this.loadForCollege(id, collegeId);
    // deleteMeetEvent is itself best-effort (never throws — logs and
    // swallows internally), so no extra try/catch needed here.
    if (slot.mode === "gmeet" && slot.googleEventId) {
      await deleteMeetEvent(slot.googleEventId);
    }
    const row = await InterviewSlotRepository.setStatus(id, "cancelled");
    return mapSlot(row);
  }
}
