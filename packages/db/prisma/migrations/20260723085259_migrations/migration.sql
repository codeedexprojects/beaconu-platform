/*
  Warnings:

  - You are about to drop the column `total_duration_mins` on the `assessment_templates` table. All the data in the column will be lost.
  - You are about to drop the column `total_marks` on the `assessment_templates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "assessment_templates" DROP COLUMN "total_duration_mins",
DROP COLUMN "total_marks";
