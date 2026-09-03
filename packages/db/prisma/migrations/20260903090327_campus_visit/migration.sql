/*
  Warnings:

  - You are about to drop the column `time` on the `campus_visit_availability` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "campus_visit_availability" DROP COLUMN IF EXISTS "time";

-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "campus_visit_settings_seq";

-- CreateTable
CREATE TABLE "campus_visit_settings" (
    "id" TEXT NOT NULL DEFAULT ('CVS-'::text || (nextval('campus_visit_settings_seq'::regclass))::text),
    "college_id" TEXT NOT NULL,
    "visit_start_time" TIME NOT NULL,
    "visit_end_time" TIME NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "campus_visit_settings_pkey" PRIMARY KEY ("id")
);

-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "campus_visit_date_override_seq";

-- CreateTable
CREATE TABLE "campus_visit_date_overrides" (
    "id" TEXT NOT NULL DEFAULT ('CVH-'::text || (nextval('campus_visit_date_override_seq'::regclass))::text),
    "college_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "campus_visit_date_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campus_visit_settings_college_id_key" ON "campus_visit_settings"("college_id");

-- CreateIndex
CREATE INDEX "idx_visit_date_override_college_date" ON "campus_visit_date_overrides"("college_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "campus_visit_date_overrides_college_id_date_key" ON "campus_visit_date_overrides"("college_id", "date");

-- AddForeignKey
ALTER TABLE "campus_visit_settings" ADD CONSTRAINT "campus_visit_settings_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campus_visit_date_overrides" ADD CONSTRAINT "campus_visit_date_overrides_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campus_visit_date_overrides" ADD CONSTRAINT "campus_visit_date_overrides_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
