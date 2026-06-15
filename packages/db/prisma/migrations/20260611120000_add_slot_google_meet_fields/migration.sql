-- Each availability slot gets its own Google Meet link, generated when the
-- slot is created. At booking time the student is added as an attendee to
-- this same Calendar event instead of creating a new one.
ALTER TABLE "counsellor_availability"
  ADD COLUMN "meeting_url" TEXT,
  ADD COLUMN "meeting_id" VARCHAR(50),
  ADD COLUMN "google_event_id" VARCHAR(255);
