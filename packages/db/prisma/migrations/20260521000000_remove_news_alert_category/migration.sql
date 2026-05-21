-- Drop the category index first, then the column
DROP INDEX IF EXISTS "idx_news_category";
ALTER TABLE "news_alerts" DROP COLUMN IF EXISTS "category";
