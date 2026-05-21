-- AlterTable
ALTER TABLE "news_alerts" ADD COLUMN     "source" TEXT,
ADD COLUMN     "tags" JSONB NOT NULL DEFAULT '[]';
