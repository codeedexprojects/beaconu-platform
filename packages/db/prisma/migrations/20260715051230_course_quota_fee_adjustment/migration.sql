/*
  Warnings:

  - You are about to drop the column `app_fee_reduction_type` on the `course_quotas` table. All the data in the column will be lost.
  - You are about to drop the column `app_fee_reduction_value` on the `course_quotas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "course_quotas" DROP COLUMN "app_fee_reduction_type",
DROP COLUMN "app_fee_reduction_value",
ADD COLUMN     "app_fee_adjustment_type" VARCHAR(10),
ADD COLUMN     "app_fee_adjustment_value" DECIMAL(10,2);
