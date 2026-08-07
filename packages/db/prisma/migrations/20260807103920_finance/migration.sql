-- AlterTable
ALTER TABLE "student_fee_ledger" ADD COLUMN     "fee_structure_id" TEXT;

-- CreateIndex
CREATE INDEX "idx_ledger_fee_structure" ON "student_fee_ledger"("fee_structure_id");

-- AddForeignKey
ALTER TABLE "student_fee_ledger" ADD CONSTRAINT "student_fee_ledger_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "fee_structures"("id") ON DELETE SET NULL ON UPDATE CASCADE;
