-- DropForeignKey
ALTER TABLE "libraries" DROP CONSTRAINT "libraries_department_id_fkey";

-- AddForeignKey
ALTER TABLE "libraries" ADD CONSTRAINT "libraries_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "disciplines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
