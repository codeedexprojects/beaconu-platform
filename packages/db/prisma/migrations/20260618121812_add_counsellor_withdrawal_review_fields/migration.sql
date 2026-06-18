-- AlterTable
ALTER TABLE "counsellor_wallet_transactions"
ADD COLUMN     "reviewed_by" TEXT,
ADD COLUMN     "review_remarks" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "counsellor_wallet_transactions" ADD CONSTRAINT "counsellor_wallet_transactions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "platform_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
