-- AlterTable
ALTER TABLE "seat_cancellations" ADD COLUMN     "google_event_id" VARCHAR(255),
ADD COLUMN     "meeting_id" VARCHAR(100),
ADD COLUMN     "meeting_url" TEXT;
