/*
  Warnings:

  - You are about to drop the column `fee_amount` on the `document_templates` table. All the data in the column will be lost.
  - You are about to drop the column `has_fee` on the `document_templates` table. All the data in the column will be lost.
  - Added the required column `category` to the `document_templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "document_requests" ADD COLUMN     "office_contact_phone" VARCHAR(20),
ADD COLUMN     "pickup_instructions" TEXT,
ADD COLUMN     "status_history" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "document_submission_requests" ADD COLUMN     "status_history" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "document_templates" DROP COLUMN "fee_amount",
DROP COLUMN "has_fee",
ADD COLUMN     "category" VARCHAR(50) NOT NULL,
ADD COLUMN     "instructions" TEXT;
