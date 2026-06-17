-- AlterTable
ALTER TABLE "colleges" ADD COLUMN     "address_from_lead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lead_id" VARCHAR(100),
ADD COLUMN     "registration_tabs" JSONB NOT NULL DEFAULT '[]';
