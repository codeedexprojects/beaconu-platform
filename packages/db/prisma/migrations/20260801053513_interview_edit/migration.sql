/*
  Warnings:

  - You are about to drop the column `description` on the `interview_settings` table. All the data in the column will be lost.
  - You are about to drop the column `heading` on the `interview_settings` table. All the data in the column will be lost.
  - You are about to drop the column `instructions` on the `interview_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "interview_settings" DROP COLUMN "description",
DROP COLUMN "heading",
DROP COLUMN "instructions",
ADD COLUMN     "gmeet_description" TEXT,
ADD COLUMN     "gmeet_heading" VARCHAR(255),
ADD COLUMN     "gmeet_instructions" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "on_campus_description" TEXT,
ADD COLUMN     "on_campus_heading" VARCHAR(255),
ADD COLUMN     "on_campus_instructions" JSONB NOT NULL DEFAULT '[]';
