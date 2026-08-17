-- AlterTable
ALTER TABLE "college_wishlists" ADD COLUMN     "course_id" TEXT;

-- AddForeignKey
ALTER TABLE "college_wishlists" ADD CONSTRAINT "college_wishlists_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
