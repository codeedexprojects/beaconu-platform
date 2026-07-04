-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "document_submission_request_seq";

-- CreateTable
CREATE TABLE "document_submission_requests" (
    "id" TEXT NOT NULL DEFAULT ('DSR-'::text || (nextval('document_submission_request_seq'::regclass))::text),
    "college_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "document_type" VARCHAR(100) NOT NULL,
    "instructions" TEXT,
    "deadline" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "file_url" TEXT,
    "file_name" VARCHAR(255),
    "file_size_bytes" INTEGER,
    "submitted_at" TIMESTAMPTZ,
    "rejection_reason" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "document_submission_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_docsubreq_college" ON "document_submission_requests"("college_id");

-- CreateIndex
CREATE INDEX "idx_docsubreq_student" ON "document_submission_requests"("student_id");

-- CreateIndex
CREATE INDEX "idx_docsubreq_status" ON "document_submission_requests"("college_id", "status");

-- AddForeignKey
ALTER TABLE "document_submission_requests" ADD CONSTRAINT "document_submission_requests_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_submission_requests" ADD CONSTRAINT "document_submission_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_submission_requests" ADD CONSTRAINT "document_submission_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "staff_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_submission_requests" ADD CONSTRAINT "document_submission_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
