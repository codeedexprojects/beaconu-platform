-- Create entrance_exams table
CREATE TABLE "entrance_exams" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "code" VARCHAR(20) NOT NULL,
  "conducting_body" VARCHAR(255),
  "exam_level" VARCHAR(20) NOT NULL,
  "applicable_courses" JSONB NOT NULL DEFAULT '[]',
  "eligibility" TEXT,
  "description" TEXT,
  "registration_start" DATE,
  "registration_end" DATE,
  "exam_date" DATE,
  "result_date" DATE,
  "official_website" TEXT,
  "status" VARCHAR(20) NOT NULL DEFAULT 'active',
  "created_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "entrance_exams_pkey" PRIMARY KEY ("id")
);

-- Unique constraint on code
CREATE UNIQUE INDEX "entrance_exams_code_key" ON "entrance_exams"("code");

-- Indexes
CREATE INDEX "idx_exams_level" ON "entrance_exams"("exam_level");
CREATE INDEX "idx_exams_status" ON "entrance_exams"("status");
CREATE INDEX "idx_exams_dates" ON "entrance_exams"("exam_date");
CREATE INDEX "idx_exams_code" ON "entrance_exams"("code");

-- FK to platform_admins
ALTER TABLE "entrance_exams" ADD CONSTRAINT "entrance_exams_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "platform_admins"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
