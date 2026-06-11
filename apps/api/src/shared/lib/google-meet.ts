import { randomUUID } from "crypto";
import { calendar, calendar_v3 } from "@googleapis/calendar";
import { JWT } from "google-auth-library";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/lib/logger";

let _calendar: calendar_v3.Calendar | null = null;

export function isGoogleMeetReady(): boolean {
  return !!(
    env.GOOGLE_MEET_SERVICE_ACCOUNT_EMAIL &&
    env.GOOGLE_MEET_SERVICE_ACCOUNT_PRIVATE_KEY &&
    env.GOOGLE_MEET_CALENDAR_ID
  );
}

function getCalendarClient(): calendar_v3.Calendar {
  if (!isGoogleMeetReady()) {
    throw new Error(
      "Google Meet is not configured. Set GOOGLE_MEET_SERVICE_ACCOUNT_EMAIL, " +
        "GOOGLE_MEET_SERVICE_ACCOUNT_PRIVATE_KEY and GOOGLE_MEET_CALENDAR_ID.",
    );
  }

  if (!_calendar) {
    const auth = new JWT({
      email: env.GOOGLE_MEET_SERVICE_ACCOUNT_EMAIL,
      // Render/most env stores escape newlines as literal "\n".
      key: env.GOOGLE_MEET_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
    });
    _calendar = calendar({ version: "v3", auth });
  }

  return _calendar;
}

export interface CreateMeetEventParams {
  summary: string;
  description?: string;
  /** ISO 8601 datetime, e.g. 2026-06-15T10:00:00.000Z */
  startDateTime: string;
  /** ISO 8601 datetime, e.g. 2026-06-15T10:45:00.000Z */
  endDateTime: string;
  attendeeEmails: string[];
}

export interface MeetEventResult {
  eventId: string;
  meetingUrl: string;
  meetingId: string | null;
}

/**
 * Creates a Google Calendar event with an auto-generated Google Meet link.
 * Returns null if Meet creation fails — booking should not fail because of
 * a calendar/Meet outage; the counsellor can add a meeting link manually.
 */
export async function createMeetEvent(
  params: CreateMeetEventParams,
): Promise<MeetEventResult | null> {
  try {
    const calendar = getCalendarClient();

    const response = await calendar.events.insert({
      calendarId: env.GOOGLE_MEET_CALENDAR_ID,
      conferenceDataVersion: 1,
      sendUpdates: "all",
      requestBody: {
        summary: params.summary,
        description: params.description,
        start: { dateTime: params.startDateTime, timeZone: "UTC" },
        end: { dateTime: params.endDateTime, timeZone: "UTC" },
        attendees: params.attendeeEmails.map((email) => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
    });

    const event = response.data;
    const meetingUrl = event.conferenceData?.entryPoints?.find(
      (entryPoint) => entryPoint.entryPointType === "video",
    )?.uri;

    if (!event.id || !meetingUrl) {
      logger.error(
        { eventId: event.id },
        "Google Calendar event created without a Meet link",
      );
      return null;
    }

    return {
      eventId: event.id,
      meetingUrl,
      meetingId: event.conferenceData?.conferenceId ?? null,
    };
  } catch (error) {
    logger.error({ err: error }, "Failed to create Google Meet event");
    return null;
  }
}

/** Best-effort update of an existing event's time, e.g. on reschedule. */
export async function updateMeetEventTime(
  eventId: string,
  startDateTime: string,
  endDateTime: string,
): Promise<void> {
  try {
    const calendar = getCalendarClient();
    await calendar.events.patch({
      calendarId: env.GOOGLE_MEET_CALENDAR_ID,
      eventId,
      sendUpdates: "all",
      requestBody: {
        start: { dateTime: startDateTime, timeZone: "UTC" },
        end: { dateTime: endDateTime, timeZone: "UTC" },
      },
    });
  } catch (error) {
    logger.error(
      { err: error, eventId },
      "Failed to update Google Meet event time",
    );
  }
}

/** Best-effort cancellation of a Google Calendar event for a session. */
export async function deleteMeetEvent(eventId: string): Promise<void> {
  try {
    const calendar = getCalendarClient();
    await calendar.events.delete({
      calendarId: env.GOOGLE_MEET_CALENDAR_ID,
      eventId,
      sendUpdates: "all",
    });
  } catch (error) {
    logger.error({ err: error, eventId }, "Failed to delete Google Meet event");
  }
}
