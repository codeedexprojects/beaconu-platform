-- AlterTable
ALTER TABLE "assessment_templates" ADD COLUMN     "instructions" JSONB NOT NULL DEFAULT '[]';
