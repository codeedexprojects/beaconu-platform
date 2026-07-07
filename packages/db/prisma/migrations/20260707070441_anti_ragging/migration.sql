/*
  Warnings:

  - Added the required column `incident_date` to the `anti_ragging_complaints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `incident_type` to the `anti_ragging_complaints` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "anti_ragging_complaints" ADD COLUMN     "incident_date" DATE NOT NULL,
ADD COLUMN     "incident_time" TIME,
ADD COLUMN     "incident_type" VARCHAR(20) NOT NULL,
ADD COLUMN     "individuals_involved" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "status_history" JSONB NOT NULL DEFAULT '[]';
