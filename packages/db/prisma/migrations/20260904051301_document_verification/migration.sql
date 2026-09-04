-- AlterTable
ALTER TABLE "application_documents" ADD COLUMN     "resubmission_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "verification_history" JSONB NOT NULL DEFAULT '[]';
