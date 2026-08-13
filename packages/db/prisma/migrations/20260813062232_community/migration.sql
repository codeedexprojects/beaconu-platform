-- AlterTable
ALTER TABLE "colleges" ADD COLUMN     "community_link_url" TEXT;

-- AlterTable
ALTER TABLE "support_tickets" ALTER COLUMN "status" SET DEFAULT 'awaiting_response';
