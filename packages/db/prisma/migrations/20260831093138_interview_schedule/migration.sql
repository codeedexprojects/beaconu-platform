/*
  Warnings:

  - You are about to drop the column `booked_at` on the `interview_bookings` table. All the data in the column will be lost.
  - You are about to drop the column `slot_id` on the `interview_bookings` table. All the data in the column will be lost.
  - You are about to drop the `interview_reschedules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `interview_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `interview_slots` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `college_id` to the `interview_bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
-- (IF EXISTS added throughout this block: live DB has already drifted from
-- migration history — interview_slots/interview_settings/interview_reschedules
-- and interview_bookings.slot_id have none of these FK constraints actually
-- present, confirmed via pg_constraint before patching. Same class of drift
-- documented in project memory; tolerate it rather than fail on it.)
ALTER TABLE "interview_bookings" DROP CONSTRAINT IF EXISTS "interview_bookings_slot_id_fkey";

-- DropForeignKey
ALTER TABLE "interview_reschedules" DROP CONSTRAINT IF EXISTS "interview_reschedules_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "interview_reschedules" DROP CONSTRAINT IF EXISTS "interview_reschedules_from_slot_id_fkey";

-- DropForeignKey
ALTER TABLE "interview_reschedules" DROP CONSTRAINT IF EXISTS "interview_reschedules_reviewed_by_fkey";

-- DropForeignKey
ALTER TABLE "interview_reschedules" DROP CONSTRAINT IF EXISTS "interview_reschedules_student_id_fkey";

-- DropForeignKey
ALTER TABLE "interview_reschedules" DROP CONSTRAINT IF EXISTS "interview_reschedules_to_slot_id_fkey";

-- DropForeignKey
ALTER TABLE "interview_settings" DROP CONSTRAINT IF EXISTS "interview_settings_college_id_fkey";

-- DropForeignKey
ALTER TABLE "interview_slots" DROP CONSTRAINT IF EXISTS "interview_slots_campus_id_fkey";

-- DropForeignKey
ALTER TABLE "interview_slots" DROP CONSTRAINT IF EXISTS "interview_slots_college_id_fkey";

-- DropForeignKey
ALTER TABLE "interview_slots" DROP CONSTRAINT IF EXISTS "interview_slots_interviewer_id_fkey";

-- DropIndex
DROP INDEX IF EXISTS "idx_ibookings_slot";

-- DropIndex
DROP INDEX IF EXISTS "idx_ibookings_status";

-- AlterTable
ALTER TABLE "interview_bookings" DROP COLUMN "booked_at",
DROP COLUMN "slot_id",
ADD COLUMN     "college_id" TEXT,
ADD COLUMN     "end_time" TIME,
ADD COLUMN     "google_event_id" VARCHAR(255),
ADD COLUMN     "meeting_id" VARCHAR(50),
ADD COLUMN     "meeting_url" TEXT,
ADD COLUMN     "mode" VARCHAR(20),
ADD COLUMN     "panel_member_id" TEXT,
ADD COLUMN     "scheduled_at" TIMESTAMPTZ,
ADD COLUMN     "scheduled_by" TEXT,
ADD COLUMN     "scheduled_date" DATE,
ADD COLUMN     "start_time" TIME,
ADD COLUMN     "venue" VARCHAR(255),
ALTER COLUMN "status" SET DEFAULT 'scheduled';

-- Backfill: college_id has no default and the table isn't empty (a few
-- test bookings from earlier this session) — derive it from the same
-- Application every booking already points at, then enforce NOT NULL.
UPDATE "interview_bookings" ib
SET "college_id" = a."college_id"
FROM "applications" a
WHERE a."id" = ib."application_id";

ALTER TABLE "interview_bookings" ALTER COLUMN "college_id" SET NOT NULL;

-- DropTable
DROP TABLE "interview_reschedules";

-- DropTable
DROP TABLE "interview_settings";

-- DropTable
DROP TABLE "interview_slots";

-- CreateIndex
CREATE INDEX "idx_ibookings_college_status" ON "interview_bookings"("college_id", "status");

-- CreateIndex
CREATE INDEX "idx_ibookings_panel_member" ON "interview_bookings"("panel_member_id");

-- CreateIndex
CREATE INDEX "idx_ibookings_college_date" ON "interview_bookings"("college_id", "scheduled_date");

-- AddForeignKey
ALTER TABLE "interview_bookings" ADD CONSTRAINT "interview_bookings_panel_member_id_fkey" FOREIGN KEY ("panel_member_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_bookings" ADD CONSTRAINT "interview_bookings_scheduled_by_fkey" FOREIGN KEY ("scheduled_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
