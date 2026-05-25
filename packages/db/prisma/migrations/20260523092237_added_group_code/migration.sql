/*
  Warnings:

  - You are about to drop the column `application_link` on the `entrance_exams` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "college_onboarding_requests" ADD COLUMN     "group_code" VARCHAR(20);

-- AlterTable
ALTER TABLE "colleges" ADD COLUMN     "requested_group_code" VARCHAR(30);

-- AlterTable
ALTER TABLE "entrance_exams" DROP COLUMN "application_link";
