import { randomUUID } from "crypto";
import { calendar, calendar_v3 } from "@googleapis/calendar";
import { OAuth2Client } from "google-auth-library";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/lib/logger";

let _calendar: calendar_v3.Calendar | null = null;

export function isGoogleMeetReady(): boolean {
  return !!(
    env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET &&
    env.GOOGLE_MEET_REFRESH_TOKEN &&
    env.GOOGLE_MEET_CALENDAR_ID
  );
}

function getCalendarClient(): calendar_v3.Calendar {
  if (!isGoogleMeetReady()) {
    throw new Error(
      "Google Meet is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, " +
        "GOOGLE_MEET_REFRESH_TOKEN and GOOGLE_MEET_CALENDAR_ID.",
    );
  }

  if (!_calendar) {
    const auth = new OAuth2Client({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    });
    auth.setCredentials({ refresh_token: env.GOOGLE_MEET_REFRESH_TOKEN });
    _calendar = calendar({ version: "v3", auth });
  }

  return _calendar;
}

export interface CreateMeetEventParams {
  summary: string;
  description?: string;
  /** Timezone-naive datetime in Asia/Kolkata, e.g. 2026-06-15T10:00:00 */
  startDateTime: string;
  /** Timezone-naive datetime in Asia/Kolkata, e.g. 2026-06-15T10:45:00 */
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
        start: { dateTime: params.startDateTime, timeZone: "Asia/Kolkata" },
        end: { dateTime: params.endDateTime, timeZone: "Asia/Kolkata" },
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
        start: { dateTime: startDateTime, timeZone: "Asia/Kolkata" },
        end: { dateTime: endDateTime, timeZone: "Asia/Kolkata" },
      },
    });
  } catch (error) {
    logger.error(
      { err: error, eventId },
      "Failed to update Google Meet event time",
    );
  }
}

/**
 * Best-effort: adds an attendee (e.g. the booking student) to an existing
 * Calendar event without removing existing attendees.
 */
export async function addEventAttendee(
  eventId: string,
  attendeeEmail: string,
): Promise<void> {
  try {
    const calendar = getCalendarClient();

    const existing = await calendar.events.get({
      calendarId: env.GOOGLE_MEET_CALENDAR_ID,
      eventId,
    });

    const attendees = existing.data.attendees ?? [];
    if (attendees.some((attendee) => attendee.email === attendeeEmail)) {
      return;
    }

    await calendar.events.patch({
      calendarId: env.GOOGLE_MEET_CALENDAR_ID,
      eventId,
      sendUpdates: "all",
      requestBody: {
        attendees: [...attendees, { email: attendeeEmail }],
      },
    });
  } catch (error) {
    logger.error(
      { err: error, eventId },
      "Failed to add attendee to Google Meet event",
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
