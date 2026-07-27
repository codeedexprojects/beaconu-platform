-- DropIndex
DROP INDEX "applications_student_id_admission_cycle_id_key";

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "address_details" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "family_details" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "personal_details" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "qualification_details" JSONB NOT NULL DEFAULT '{}';
