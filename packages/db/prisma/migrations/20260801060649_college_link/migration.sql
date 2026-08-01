-- AlterTable
ALTER TABLE "interview_slots" ADD COLUMN     "campus_id" TEXT;

-- CreateIndex
CREATE INDEX "idx_islots_campus" ON "interview_slots"("campus_id");

-- AddForeignKey
ALTER TABLE "interview_slots" ADD CONSTRAINT "interview_slots_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
