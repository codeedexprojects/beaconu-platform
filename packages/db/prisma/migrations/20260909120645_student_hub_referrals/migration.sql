-- Prisma's diff engine never emits CREATE SEQUENCE for dbgenerated() id
-- defaults, so without these the CREATE TABLE statements below fail shadow-DB
-- validation (P3006). Documented exception in the root CLAUDE.md; matching
-- entries added to prisma/sequences.sql.
CREATE SEQUENCE IF NOT EXISTS student_referral_code_seq;
CREATE SEQUENCE IF NOT EXISTS student_referral_seq;

-- AlterTable
ALTER TABLE "student_wallet_transactions" ADD COLUMN     "payout_details" JSONB,
ADD COLUMN     "review_remarks" VARCHAR(500),
ADD COLUMN     "reviewed_at" TIMESTAMPTZ,
ADD COLUMN     "reviewed_by" TEXT,
ADD COLUMN     "student_referral_id" TEXT;

-- AlterTable
ALTER TABLE "platform_configs" ADD COLUMN     "student_min_withdrawal_amount" DECIMAL(10,2) NOT NULL DEFAULT 500.00,
ADD COLUMN     "student_referral_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "student_referral_codes" (
    "id" TEXT NOT NULL DEFAULT ('SRC-'::text || (nextval('student_referral_code_seq'::regclass))::text),
    "student_id" TEXT NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "share_url" TEXT,
    "total_clicks" INTEGER NOT NULL DEFAULT 0,
    "total_signups" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "student_referral_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_referrals" (
    "id" TEXT NOT NULL DEFAULT ('SRF-'::text || (nextval('student_referral_seq'::regclass))::text),
    "referral_code_id" TEXT NOT NULL,
    "referrer_student_id" TEXT NOT NULL,
    "referred_student_id" TEXT NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'signed_up',
    "status_history" JSONB NOT NULL DEFAULT '[]',
    "payout_base_amount" DECIMAL(10,2),
    "payout_percentage" DECIMAL(5,2),
    "payout_amount" DECIMAL(10,2),
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "student_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_referral_codes_student_id_key" ON "student_referral_codes"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_referral_codes_code_key" ON "student_referral_codes"("code");

-- CreateIndex
CREATE INDEX "idx_srefcode_code" ON "student_referral_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "student_referrals_referred_student_id_key" ON "student_referrals"("referred_student_id");

-- CreateIndex
CREATE INDEX "idx_sref_referrer" ON "student_referrals"("referrer_student_id");

-- CreateIndex
CREATE INDEX "idx_sref_status" ON "student_referrals"("status");

-- CreateIndex
CREATE INDEX "idx_sref_code" ON "student_referrals"("referral_code_id");

-- AddForeignKey
ALTER TABLE "student_wallet_transactions" ADD CONSTRAINT "student_wallet_transactions_student_referral_id_fkey" FOREIGN KEY ("student_referral_id") REFERENCES "student_referrals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_referral_codes" ADD CONSTRAINT "student_referral_codes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_referrals" ADD CONSTRAINT "student_referrals_referral_code_id_fkey" FOREIGN KEY ("referral_code_id") REFERENCES "student_referral_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_referrals" ADD CONSTRAINT "student_referrals_referrer_student_id_fkey" FOREIGN KEY ("referrer_student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_referrals" ADD CONSTRAINT "student_referrals_referred_student_id_fkey" FOREIGN KEY ("referred_student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Also hand-added: Prisma cannot express CHECK constraints. A student must
-- never be able to refer themselves.
ALTER TABLE "student_referrals" ADD CONSTRAINT "chk_sref_no_self"
  CHECK ("referrer_student_id" <> "referred_student_id");
