-- AlterTable
ALTER TABLE "admission_cycles" ADD COLUMN     "token_offline_payment_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "token_online_payment_enabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "student_note" TEXT;
