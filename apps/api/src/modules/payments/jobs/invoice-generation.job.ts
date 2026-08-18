import { Queue, Worker } from "bullmq";
import { createQueue, createWorker } from "@/shared/lib/queue";
import { logger } from "@/shared/lib/logger";
import { PaymentReceiptService } from "../services/payment-receipt.service";

const QUEUE_NAME = "payments-invoice-generation";

let queue: Queue | null = null;
let worker: Worker | null = null;

export async function startInvoiceGenerationWorker(): Promise<void> {
  queue = createQueue(QUEUE_NAME);

  worker = createWorker<{ transactionId: string }>(QUEUE_NAME, async (job) => {
    await PaymentReceiptService.issueReceipt(job.data.transactionId);
  });
}

export async function stopInvoiceGenerationWorker(): Promise<void> {
  await worker?.close();
  await queue?.close();
}

/** Fire-and-forget — a missing invoice is recoverable (can be regenerated
 * later), so failing to enqueue must never fail the payment confirmation
 * that triggered it. Same reasoning as notifyPaymentConfirmed(). */
export async function enqueueInvoiceGeneration(
  transactionId: string,
): Promise<void> {
  try {
    if (!queue) {
      logger.error(
        { transactionId, module: "payments" },
        "Invoice generation queue not initialized — skipping",
      );
      return;
    }
    await queue.add(
      "generate-invoice",
      { transactionId },
      { removeOnComplete: true, removeOnFail: 50 },
    );
  } catch (error) {
    logger.error(
      { error, transactionId, module: "payments" },
      "Failed to enqueue invoice generation",
    );
  }
}
