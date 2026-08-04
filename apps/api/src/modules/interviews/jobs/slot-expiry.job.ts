import { Queue, Worker } from "bullmq";
import { createQueue, createWorker } from "@/shared/lib/queue";
import { logger } from "@/shared/lib/logger";
import { InterviewSlotService } from "../services/interview-slot.service";

const QUEUE_NAME = "interview-slot-expiry";
const REPEAT_JOB_ID = "interview-slot-expiry-repeat";
const EVERY_MS = 24 * 60 * 60 * 1000;

let queue: Queue | null = null;
let worker: Worker | null = null;

export async function startInterviewSlotExpiryJob(): Promise<void> {
  queue = createQueue(QUEUE_NAME);

  worker = createWorker(QUEUE_NAME, async () => {
    const count = await InterviewSlotService.cleanupExpiredSlots();
    logger.info(
      { count, module: "interviews", action: "SLOT_EXPIRY" },
      "Cancelled past-date interview slots",
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

export async function stopInterviewSlotExpiryJob(): Promise<void> {
  await worker?.close();
  await queue?.close();
}
