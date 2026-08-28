-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "call_request_seq";

-- CreateTable
CREATE TABLE "call_requests" (
    "id" TEXT NOT NULL DEFAULT ('CRQ-'::text || (nextval('call_request_seq'::regclass))::text),
    "student_id" TEXT NOT NULL,
    "college_id" TEXT NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "preferred_time" VARCHAR(100),
    "message" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "staff_note" TEXT,
    "responded_by" TEXT,
    "responded_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "call_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_call_requests_student" ON "call_requests"("student_id");

-- CreateIndex
CREATE INDEX "idx_call_requests_college" ON "call_requests"("college_id");

-- CreateIndex
CREATE INDEX "idx_call_requests_status" ON "call_requests"("college_id", "status");

-- AddForeignKey
ALTER TABLE "call_requests" ADD CONSTRAINT "call_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_requests" ADD CONSTRAINT "call_requests_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_requests" ADD CONSTRAINT "call_requests_responded_by_fkey" FOREIGN KEY ("responded_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
