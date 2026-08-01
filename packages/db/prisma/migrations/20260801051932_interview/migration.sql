/*
  Warnings:

  - You are about to drop the column `phone_number` on the `interview_slots` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "interview_slots" DROP COLUMN "phone_number";

-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "interview_settings_seq";

-- CreateTable
CREATE TABLE "interview_settings" (
    "id" TEXT NOT NULL DEFAULT ('ITC-'::text || (nextval('interview_settings_seq'::regclass))::text),
    "college_id" TEXT NOT NULL,
    "allow_gmeet" BOOLEAN NOT NULL DEFAULT true,
    "allow_on_campus" BOOLEAN NOT NULL DEFAULT true,
    "heading" VARCHAR(255),
    "description" TEXT,
    "instructions" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "interview_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interview_settings_college_id_key" ON "interview_settings"("college_id");

-- AddForeignKey
ALTER TABLE "interview_settings" ADD CONSTRAINT "interview_settings_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
