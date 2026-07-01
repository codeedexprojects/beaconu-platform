-- Make ambassador_id nullable (student may not select one upfront)
ALTER TABLE "campus_visits" ALTER COLUMN "ambassador_id" DROP NOT NULL;

-- Add missing form fields
ALTER TABLE "campus_visits"
  ADD COLUMN "email"                     VARCHAR(255),
  ADD COLUMN "phone_number"              VARCHAR(20),
  ADD COLUMN "additional_visitors_count" SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN "guests"                    JSONB,
  ADD COLUMN "reason_for_visit"          TEXT,
  ADD COLUMN "cancellation_reason"       TEXT,
  ADD COLUMN "rejection_reason"          TEXT,
  ADD COLUMN "previous_proposed_date"    DATE,
  ADD COLUMN "previous_proposed_time"    TIME,
  ADD COLUMN "rescheduled_at"            TIMESTAMPTZ;
