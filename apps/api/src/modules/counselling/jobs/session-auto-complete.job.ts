import { Queue, Worker } from "bullmq";
import { createQueue, createWorker } from "@/shared/lib/queue";
import { logger } from "@/shared/lib/logger";
import { SessionService } from "../services/sessions.service";

const QUEUE_NAME = "counselling-session-auto-complete";
const REPEAT_JOB_ID = "session-auto-complete-repeat";
const EVERY_MS = 5 * 60 * 1000; // every 5 minutes

let queue: Queue | null = null;
let worker: Worker | null = null;

/** Starts the worker and schedules the repeatable auto-complete job. */
export async function startSessionAutoCompleteJob(): Promise<void> {
  queue = createQueue(QUEUE_NAME);

  worker = createWorker(QUEUE_NAME, async () => {
    const count = await SessionService.autoCompletePastSessions();
    if (count > 0) {
      logger.info(
        { count, module: "counselling", action: "SESSION_AUTO_COMPLETE" },
        "Auto-completed past counselling sessions",
      );
    }
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

export async function stopSessionAutoCompleteJob(): Promise<void> {
  await worker?.close();
  await queue?.close();
}
