-- DropIndex
DROP INDEX "idx_blink_ambassador_code";

-- DropIndex
DROP INDEX "idx_counsellors_code";

-- AlterTable
ALTER TABLE "counsellors" ALTER COLUMN "counsellor_code" DROP DEFAULT;
