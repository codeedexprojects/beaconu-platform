/*
  Warnings:

  - You are about to drop the `seat_matrix` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `seat_matrix_courses` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateSequence (Prisma does not emit CREATE SEQUENCE for dbgenerated() ID defaults)
CREATE SEQUENCE IF NOT EXISTS "course_quota_seats_seq";
CREATE SEQUENCE IF NOT EXISTS "seat_pool_seq";

-- DropForeignKey
ALTER TABLE "seat_matrix" DROP CONSTRAINT "seat_matrix_admission_cycle_id_fkey";

-- DropForeignKey
ALTER TABLE "seat_matrix" DROP CONSTRAINT "seat_matrix_college_quota_id_fkey";

-- DropForeignKey
ALTER TABLE "seat_matrix_courses" DROP CONSTRAINT "seat_matrix_courses_course_id_fkey";

-- DropForeignKey
ALTER TABLE "seat_matrix_courses" DROP CONSTRAINT "seat_matrix_courses_seat_matrix_id_fkey";

-- DropTable
DROP TABLE "seat_matrix";

-- DropTable
DROP TABLE "seat_matrix_courses";

-- CreateTable
CREATE TABLE "course_quota_seats" (
    "id" TEXT NOT NULL DEFAULT ('CQS-'::text || (nextval('course_quota_seats_seq'::regclass))::text),
    "admission_cycle_course_id" TEXT NOT NULL,
    "college_quota_id" TEXT NOT NULL,
    "seat_pool_id" TEXT,
    "total_seats" INTEGER,
    "open_seats" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "course_quota_seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_pools" (
    "id" TEXT NOT NULL DEFAULT ('SPL-'::text || (nextval('seat_pool_seq'::regclass))::text),
    "college_quota_id" TEXT NOT NULL,
    "admission_cycle_id" TEXT NOT NULL,
    "total_seats" INTEGER NOT NULL,
    "open_seats" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "seat_pools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_cqs_cycle_course" ON "course_quota_seats"("admission_cycle_course_id");

-- CreateIndex
CREATE INDEX "idx_cqs_quota" ON "course_quota_seats"("college_quota_id");

-- CreateIndex
CREATE INDEX "idx_cqs_seat_pool" ON "course_quota_seats"("seat_pool_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_quota_seats_admission_cycle_course_id_college_quota__key" ON "course_quota_seats"("admission_cycle_course_id", "college_quota_id");

-- CreateIndex
CREATE INDEX "idx_seat_pool_college_quota" ON "seat_pools"("college_quota_id");

-- CreateIndex
CREATE INDEX "idx_seat_pool_cycle" ON "seat_pools"("admission_cycle_id");

-- AddForeignKey
ALTER TABLE "course_quota_seats" ADD CONSTRAINT "course_quota_seats_admission_cycle_course_id_fkey" FOREIGN KEY ("admission_cycle_course_id") REFERENCES "admission_cycle_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_quota_seats" ADD CONSTRAINT "course_quota_seats_college_quota_id_fkey" FOREIGN KEY ("college_quota_id") REFERENCES "college_quotas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_quota_seats" ADD CONSTRAINT "course_quota_seats_seat_pool_id_fkey" FOREIGN KEY ("seat_pool_id") REFERENCES "seat_pools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_pools" ADD CONSTRAINT "seat_pools_college_quota_id_fkey" FOREIGN KEY ("college_quota_id") REFERENCES "college_quotas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_pools" ADD CONSTRAINT "seat_pools_admission_cycle_id_fkey" FOREIGN KEY ("admission_cycle_id") REFERENCES "admission_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
