/*
  Warnings:

  - You are about to drop the column `libraries` on the `colleges` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "colleges" DROP COLUMN "libraries";

-- AlterTable
ALTER TABLE "counsellor_wallet_transactions" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "library_seq";

-- CreateTable
CREATE TABLE "libraries" (
    "id" TEXT NOT NULL DEFAULT ('LIB-'::text || (nextval('library_seq'::regclass))::text),
    "college_id" TEXT NOT NULL,
    "department_id" TEXT,
    "type" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "stats" JSONB NOT NULL DEFAULT '[]',
    "available_resources" JSONB NOT NULL DEFAULT '{"items":[]}',
    "library_hours" JSONB NOT NULL DEFAULT '{"days":[]}',
    "facilities" JSONB NOT NULL DEFAULT '{"items":[]}',
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "libraries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_libraries_college" ON "libraries"("college_id");

-- CreateIndex
CREATE INDEX "idx_libraries_department" ON "libraries"("department_id");

-- AddForeignKey
ALTER TABLE "libraries" ADD CONSTRAINT "libraries_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "libraries" ADD CONSTRAINT "libraries_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
