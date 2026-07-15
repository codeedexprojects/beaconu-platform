CREATE SEQUENCE IF NOT EXISTS "document_upload_config_course_seq";
CREATE SEQUENCE IF NOT EXISTS "document_upload_config_quota_seq";

/*
  Warnings:

  - You are about to drop the column `quota_id` on the `application_courses` table. All the data in the column will be lost.
  - You are about to drop the column `applies_to_courses` on the `document_upload_configs` table. All the data in the column will be lost.
  - You are about to drop the column `applies_to_quotas` on the `document_upload_configs` table. All the data in the column will be lost.
  - Made the column `admission_cycle_id` on table `document_upload_configs` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "application_courses" DROP CONSTRAINT "application_courses_quota_id_fkey";

-- DropForeignKey
ALTER TABLE "document_upload_configs" DROP CONSTRAINT "document_upload_configs_admission_cycle_id_fkey";

-- AlterTable
ALTER TABLE "application_courses" DROP COLUMN "quota_id",
ADD COLUMN     "course_quota_seat_id" TEXT;

-- AlterTable
ALTER TABLE "document_upload_configs" DROP COLUMN "applies_to_courses",
DROP COLUMN "applies_to_quotas",
ALTER COLUMN "admission_cycle_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "document_upload_config_courses" (
    "id" TEXT NOT NULL DEFAULT ('DCC-'::text || (nextval('document_upload_config_course_seq'::regclass))::text),
    "document_upload_config_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_upload_config_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_upload_config_quotas" (
    "id" TEXT NOT NULL DEFAULT ('DCQ-'::text || (nextval('document_upload_config_quota_seq'::regclass))::text),
    "document_upload_config_id" TEXT NOT NULL,
    "college_quota_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_upload_config_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_ducc_config" ON "document_upload_config_courses"("document_upload_config_id");

-- CreateIndex
CREATE INDEX "idx_ducc_course" ON "document_upload_config_courses"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_upload_config_courses_document_upload_config_id_co_key" ON "document_upload_config_courses"("document_upload_config_id", "course_id");

-- CreateIndex
CREATE INDEX "idx_ducq_config" ON "document_upload_config_quotas"("document_upload_config_id");

-- CreateIndex
CREATE INDEX "idx_ducq_quota" ON "document_upload_config_quotas"("college_quota_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_upload_config_quotas_document_upload_config_id_col_key" ON "document_upload_config_quotas"("document_upload_config_id", "college_quota_id");

-- AddForeignKey
ALTER TABLE "application_courses" ADD CONSTRAINT "application_courses_course_quota_seat_id_fkey" FOREIGN KEY ("course_quota_seat_id") REFERENCES "course_quota_seats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_upload_configs" ADD CONSTRAINT "document_upload_configs_admission_cycle_id_fkey" FOREIGN KEY ("admission_cycle_id") REFERENCES "admission_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_upload_config_courses" ADD CONSTRAINT "document_upload_config_courses_document_upload_config_id_fkey" FOREIGN KEY ("document_upload_config_id") REFERENCES "document_upload_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_upload_config_courses" ADD CONSTRAINT "document_upload_config_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_upload_config_quotas" ADD CONSTRAINT "document_upload_config_quotas_document_upload_config_id_fkey" FOREIGN KEY ("document_upload_config_id") REFERENCES "document_upload_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_upload_config_quotas" ADD CONSTRAINT "document_upload_config_quotas_college_quota_id_fkey" FOREIGN KEY ("college_quota_id") REFERENCES "college_quotas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
