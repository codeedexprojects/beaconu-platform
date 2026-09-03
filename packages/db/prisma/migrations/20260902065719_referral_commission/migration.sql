/*
  Warnings:

  - A unique constraint covering the columns `[blink_user_id,college_id,course_id]` on the table `referral_codes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "commissions" DROP CONSTRAINT "commissions_service_charge_id_fkey";

-- AlterTable
ALTER TABLE "blink_wallet_transactions" ADD COLUMN     "review_remarks" VARCHAR(500),
ADD COLUMN     "reviewed_by" TEXT;

-- AlterTable
ALTER TABLE "commissions" ALTER COLUMN "service_charge_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "referral_commission_amount" DECIMAL(10,2);

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_blink_user_id_college_id_course_id_key" ON "referral_codes"("blink_user_id", "college_id", "course_id");

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_service_charge_id_fkey" FOREIGN KEY ("service_charge_id") REFERENCES "service_charge_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
