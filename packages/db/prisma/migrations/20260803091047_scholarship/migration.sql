/*
  Warnings:

  - Added the required column `annual_family_income_range` to the `scholarship_applications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "scholarship_applications" ADD COLUMN     "annual_family_income_range" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "scholarship_configs" ADD COLUMN     "required_documents" JSONB NOT NULL DEFAULT '[]';
