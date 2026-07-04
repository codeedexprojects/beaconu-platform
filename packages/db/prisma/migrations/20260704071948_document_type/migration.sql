/*
  Warnings:

  - You are about to drop the column `document_type` on the `document_submission_requests` table. All the data in the column will be lost.
  - Added the required column `document_category` to the `document_submission_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_name` to the `document_submission_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "document_submission_requests" DROP COLUMN "document_type",
ADD COLUMN     "document_category" VARCHAR(50) NOT NULL,
ADD COLUMN     "document_name" VARCHAR(255) NOT NULL;
