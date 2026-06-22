-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "counselling_refund_request_seq";

-- CreateTable
CREATE TABLE "counselling_refund_requests" (
    "id" TEXT NOT NULL DEFAULT ('CRQ-'::text || (nextval('counselling_refund_request_seq')::text)),
    "session_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "counsellor_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "upi_id" VARCHAR(100) NOT NULL,
    "reason" TEXT NOT NULL,
    "proof_url" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "review_remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "counselling_refund_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_refund_req_session" ON "counselling_refund_requests"("session_id");

-- CreateIndex
CREATE INDEX "idx_refund_req_student" ON "counselling_refund_requests"("student_id");

-- CreateIndex
CREATE INDEX "idx_refund_req_counsellor" ON "counselling_refund_requests"("counsellor_id");

-- CreateIndex
CREATE INDEX "idx_refund_req_status" ON "counselling_refund_requests"("status");

-- AddForeignKey
ALTER TABLE "counselling_refund_requests" ADD CONSTRAINT "counselling_refund_requests_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "counselling_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counselling_refund_requests" ADD CONSTRAINT "counselling_refund_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counselling_refund_requests" ADD CONSTRAINT "counselling_refund_requests_counsellor_id_fkey" FOREIGN KEY ("counsellor_id") REFERENCES "counsellors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counselling_refund_requests" ADD CONSTRAINT "counselling_refund_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "platform_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
