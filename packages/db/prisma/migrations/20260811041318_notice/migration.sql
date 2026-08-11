-- AlterTable
ALTER TABLE "announcements" ADD COLUMN     "attachments" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "required_documents" JSONB NOT NULL DEFAULT '[]';
