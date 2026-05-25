-- CreateTable
CREATE TABLE "college_onboarding_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_name" VARCHAR(255) NOT NULL,
    "university_name" VARCHAR(255),
    "contact_person_name" VARCHAR(255) NOT NULL,
    "contact_email" VARCHAR(255) NOT NULL,
    "contact_phone" VARCHAR(20),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "message" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "reviewed_by" UUID,
    "review_remarks" TEXT,
    "created_college_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "college_onboarding_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_onboard_status" ON "college_onboarding_requests"("status");

-- AddForeignKey
ALTER TABLE "college_onboarding_requests" ADD CONSTRAINT "college_onboarding_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "platform_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_onboarding_requests" ADD CONSTRAINT "college_onboarding_requests_created_college_id_fkey" FOREIGN KEY ("created_college_id") REFERENCES "colleges"("id") ON DELETE SET NULL ON UPDATE CASCADE;
