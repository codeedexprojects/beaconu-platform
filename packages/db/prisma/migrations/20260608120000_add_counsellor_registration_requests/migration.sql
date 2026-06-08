-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "counsellor_registration_request_seq";

-- CreateTable
CREATE TABLE "counsellor_registration_requests" (
    "id" TEXT NOT NULL DEFAULT ('CRR-'::text || (nextval('counsellor_registration_request_seq'::regclass))::text),
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(20),
    "counsellor_type" VARCHAR(20) NOT NULL,
    "qualification" VARCHAR(255),
    "years_of_experience" VARCHAR(50),
    "message" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "reviewed_by" UUID,
    "review_remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "counsellor_registration_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_counsellor_request_status" ON "counsellor_registration_requests"("status");

-- CreateIndex
CREATE INDEX "idx_counsellor_request_type" ON "counsellor_registration_requests"("counsellor_type");

-- AddForeignKey
ALTER TABLE "counsellor_registration_requests" ADD CONSTRAINT "counsellor_registration_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "platform_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
