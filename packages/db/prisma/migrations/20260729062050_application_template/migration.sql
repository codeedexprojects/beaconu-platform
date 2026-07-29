/*
  Warnings:

  - You are about to drop the column `application_course_id` on the `assessment_attempts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[application_id,student_id]` on the table `assessment_attempts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `application_id` to the `assessment_attempts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "assessment_attempts" DROP CONSTRAINT "assessment_attempts_application_course_id_fkey";

-- DropIndex
DROP INDEX "assessment_attempts_application_course_id_student_id_key";

-- DropIndex
DROP INDEX "idx_attempts_app_course";

-- AlterTable
ALTER TABLE "admission_cycles" ADD COLUMN     "assessment_required" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "assessment_template_id" TEXT;

-- AlterTable
ALTER TABLE "assessment_attempts" DROP COLUMN "application_course_id",
ADD COLUMN     "application_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "idx_attempts_application" ON "assessment_attempts"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_attempts_application_id_student_id_key" ON "assessment_attempts"("application_id", "student_id");

-- AddForeignKey
ALTER TABLE "admission_cycles" ADD CONSTRAINT "admission_cycles_assessment_template_id_fkey" FOREIGN KEY ("assessment_template_id") REFERENCES "assessment_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
