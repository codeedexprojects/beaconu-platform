-- Stores the Google Calendar event id backing an auto-generated Google Meet
-- link, so the event can be updated/deleted on reschedule/cancellation.
ALTER TABLE "counselling_sessions"
  ADD COLUMN "google_event_id" VARCHAR(255);
