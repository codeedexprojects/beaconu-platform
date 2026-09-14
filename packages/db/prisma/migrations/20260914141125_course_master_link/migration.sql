-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "course_master_id" TEXT;

-- CreateIndex
CREATE INDEX "idx_courses_course_master" ON "courses"("course_master_id");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_course_master_id_fkey" FOREIGN KEY ("course_master_id") REFERENCES "course_masters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

