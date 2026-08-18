import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, "../.env") });
import { prisma } from "../src/index";

// Optional, idempotent, user-run backfill — generates a PaymentReceipt (and
// its invoice PDF) for every already-`completed` Transaction that predates
// the invoice-generation feature. Never run automatically. Safe to re-run:
// PaymentReceiptService.issueReceipt() checks for an existing receipt per
// transactionId before generating a new one.
//
// Must be run from apps/api's context (uses its module resolution via
// tsx/ts-node with the @/ alias), NOT from packages/db directly — e.g.:
//   cd apps/api && npx tsx ../../packages/db/prisma/backfill-invoices.ts

async function main() {
  const { PaymentReceiptService } =
    await import("../../../apps/api/src/modules/payments/services/payment-receipt.service");

  const completedWithoutReceipt = await prisma.transaction.findMany({
    where: {
      status: "completed",
      receipt: null,
    },
    select: { id: true, transactionNumber: true },
  });

  console.log(
    `Found ${completedWithoutReceipt.length} completed transaction(s) without a receipt.`,
  );

  let succeeded = 0;
  let failed = 0;

  for (const txn of completedWithoutReceipt) {
    try {
      await PaymentReceiptService.issueReceipt(txn.id);
      succeeded++;
      console.log(`  + ${txn.transactionNumber}`);
    } catch (error) {
      failed++;
      console.error(`  ! ${txn.transactionNumber} failed:`, error);
    }
  }

  console.log(`\nBackfill complete: ${succeeded} succeeded, ${failed} failed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
