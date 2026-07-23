-- AlterTable
ALTER TABLE "assessment_attempts" ADD COLUMN     "last_activity_at" TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "assessment_papers" ADD COLUMN     "paper_type" VARCHAR(10) NOT NULL DEFAULT 'normal';

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "time_limit_secs" INTEGER NOT NULL DEFAULT 60;
