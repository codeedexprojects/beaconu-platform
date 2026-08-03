/*
  Warnings:

  - You are about to drop the column `application_course_id` on the `interview_bookings` table. All the data in the column will be lost.
  - You are about to drop the column `application_course_id` on the `scholarship_applications` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[application_id]` on the table `interview_bookings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[scholarship_config_id,student_id,application_id]` on the table `scholarship_applications` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `application_id` to the `interview_bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `application_id` to the `scholarship_applications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "interview_bookings" DROP CONSTRAINT "interview_bookings_application_course_id_fkey";

-- DropForeignKey
ALTER TABLE "scholarship_applications" DROP CONSTRAINT "scholarship_applications_application_course_id_fkey";

-- DropIndex
DROP INDEX "idx_ibookings_app_course";

-- DropIndex
DROP INDEX "interview_bookings_application_course_id_key";

-- DropIndex
DROP INDEX "idx_schapp_app_course";

-- DropIndex
DROP INDEX "scholarship_applications_scholarship_config_id_student_id_a_key";

-- AlterTable
ALTER TABLE "interview_bookings" DROP COLUMN "application_course_id",
ADD COLUMN     "application_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "scholarship_applications" DROP COLUMN "application_course_id",
ADD COLUMN     "application_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "interview_bookings_application_id_key" ON "interview_bookings"("application_id");

-- CreateIndex
CREATE INDEX "idx_ibookings_application" ON "interview_bookings"("application_id");

-- CreateIndex
CREATE INDEX "idx_schapp_application" ON "scholarship_applications"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "scholarship_applications_scholarship_config_id_student_id_a_key" ON "scholarship_applications"("scholarship_config_id", "student_id", "application_id");

-- AddForeignKey
ALTER TABLE "interview_bookings" ADD CONSTRAINT "interview_bookings_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_applications" ADD CONSTRAINT "scholarship_applications_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
