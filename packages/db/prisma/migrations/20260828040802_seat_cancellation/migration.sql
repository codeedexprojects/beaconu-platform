-- AlterTable
ALTER TABLE "seat_cancellations" ADD COLUMN     "case_type" VARCHAR(1),
ADD COLUMN     "counseling_completed_at" TIMESTAMPTZ,
ADD COLUMN     "counseling_notes" TEXT,
ADD COLUMN     "counseling_outcome" VARCHAR(20),
ADD COLUMN     "counselor_id" TEXT,
ADD COLUMN     "current_phase" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "documents_handed_over_at" TIMESTAMPTZ,
ADD COLUMN     "effective_date" DATE,
ADD COLUMN     "last_semester" VARCHAR(50),
ADD COLUMN     "penalty_amount" DECIMAL(10,2),
ADD COLUMN     "penalty_paid_at" TIMESTAMPTZ,
ADD COLUMN     "refund_calculation_method" VARCHAR(20),
ADD COLUMN     "refund_calculation_value" DECIMAL(10,2),
ADD COLUMN     "refund_payment_method" VARCHAR(100),
ADD COLUMN     "refund_processed_at" TIMESTAMPTZ,
ADD COLUMN     "refund_transaction_ref" VARCHAR(100),
ADD COLUMN     "scheduled_at" TIMESTAMPTZ,
ADD COLUMN     "settled_at" TIMESTAMPTZ,
ADD COLUMN     "suggested_case_type" VARCHAR(1);

-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "seat_cancellation_phase_log_seq";

-- CreateTable
CREATE TABLE "seat_cancellation_phase_logs" (
    "id" TEXT NOT NULL DEFAULT ('SCL-'::text || (nextval('seat_cancellation_phase_log_seq'::regclass))::text),
    "seat_cancellation_id" TEXT NOT NULL,
    "phase" INTEGER NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "performed_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seat_cancellation_phase_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_cancel_phase_logs_case" ON "seat_cancellation_phase_logs"("seat_cancellation_id", "created_at");

-- AddForeignKey
ALTER TABLE "seat_cancellations" ADD CONSTRAINT "seat_cancellations_counselor_id_fkey" FOREIGN KEY ("counselor_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_cancellation_phase_logs" ADD CONSTRAINT "seat_cancellation_phase_logs_seat_cancellation_id_fkey" FOREIGN KEY ("seat_cancellation_id") REFERENCES "seat_cancellations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_cancellation_phase_logs" ADD CONSTRAINT "seat_cancellation_phase_logs_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "staff_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
