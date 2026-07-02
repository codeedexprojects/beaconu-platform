/*
  Warnings:

  - You are about to drop the column `booked_count` on the `campus_visit_availability` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `campus_visit_availability` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[college_id,weekday]` on the table `campus_visit_availability` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `weekday` to the `campus_visit_availability` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "campus_visit_availability_college_id_date_key";

-- DropIndex
DROP INDEX "idx_visit_availability_date";

-- AlterTable: add weekday as nullable first so existing rows can be backfilled
ALTER TABLE "campus_visit_availability" ADD COLUMN "weekday" SMALLINT;

-- Backfill weekday from the existing per-date rows (0 = Sunday ... 6 = Saturday)
UPDATE "campus_visit_availability" SET "weekday" = EXTRACT(DOW FROM "date")::smallint;

-- Existing per-date rows can collide on (college_id, weekday) once collapsed to a weekly
-- grain — keep only the most recently updated row per weekday before adding the unique index.
DELETE FROM "campus_visit_availability" a
USING "campus_visit_availability" b
WHERE a."college_id" = b."college_id"
  AND a."weekday" = b."weekday"
  AND (a."updated_at", a."ctid") < (b."updated_at", b."ctid");

-- Now safe to enforce NOT NULL and drop the old per-date columns
ALTER TABLE "campus_visit_availability"
  ALTER COLUMN "weekday" SET NOT NULL,
  DROP COLUMN "booked_count",
  DROP COLUMN "date";

-- CreateIndex
CREATE INDEX "idx_visit_availability_college" ON "campus_visit_availability"("college_id");

-- CreateIndex
CREATE UNIQUE INDEX "campus_visit_availability_college_id_weekday_key" ON "campus_visit_availability"("college_id", "weekday");
