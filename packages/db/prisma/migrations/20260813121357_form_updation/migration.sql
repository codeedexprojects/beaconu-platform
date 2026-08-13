/*
  Warnings:

  - Made the column `entrance_exam_details` on table `applications` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "achievements_details" JSONB NOT NULL DEFAULT '{}',
ALTER COLUMN "entrance_exam_details" SET NOT NULL,
ALTER COLUMN "entrance_exam_details" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "achievements_details" JSONB NOT NULL DEFAULT '{}';
