import { Queue, Worker } from "bullmq";
import { createQueue, createWorker } from "@/shared/lib/queue";
import { logger } from "@/shared/lib/logger";
import { SessionService } from "../services/sessions.service";

const QUEUE_NAME = "counselling-slot-cleanup";
const REPEAT_JOB_ID = "slot-cleanup-repeat";
const EVERY_MS = 24 * 60 * 60 * 1000; // daily

let queue: Queue | null = null;
let worker: Worker | null = null;

export async function startSlotCleanupJob(): Promise<void> {
  queue = createQueue(QUEUE_NAME);

  worker = createWorker(QUEUE_NAME, async () => {
    const count = await SessionService.cleanupExpiredSlots();
    logger.info(
      { count, module: "counselling", action: "SLOT_CLEANUP" },
      "Deleted expired unbooked counsellor slots",
    );
  });

  await queue.add(
    REPEAT_JOB_ID,
    {},
    {
      repeat: { every: EVERY_MS },
      jobId: REPEAT_JOB_ID,
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
}

export async function stopSlotCleanupJob(): Promise<void> {
  await worker?.close();
  await queue?.close();
}
