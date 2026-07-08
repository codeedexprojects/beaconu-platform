/*
  Warnings:

  - Added the required column `application_type` to the `admission_cycles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "admission_cycles" ADD COLUMN     "application_type" VARCHAR(50) NOT NULL;
