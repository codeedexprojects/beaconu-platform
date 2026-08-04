/*
  Warnings:

  - A unique constraint covering the columns `[education_board_id,course,name]` on the table `education_board_subjects` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "education_board_subjects_education_board_id_name_key";

-- AlterTable
ALTER TABLE "education_board_subjects" ADD COLUMN     "course" VARCHAR(100) NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "education_board_subjects_education_board_id_course_name_key" ON "education_board_subjects"("education_board_id", "course", "name");
