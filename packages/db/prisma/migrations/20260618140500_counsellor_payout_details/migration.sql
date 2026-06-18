-- Add profile-level payout options (UPI ID and/or bank details) for counsellors
ALTER TABLE "counsellors" ADD COLUMN "upi_id" VARCHAR(100);
ALTER TABLE "counsellors" ADD COLUMN "bank_details" JSONB NOT NULL DEFAULT '{}';

-- Per-transaction snapshot can now be either bank or UPI, not bank-only
ALTER TABLE "counsellor_wallet_transactions" RENAME COLUMN "bank_details" TO "payout_details";
