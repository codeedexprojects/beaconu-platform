import { Queue, Worker } from "bullmq";
import { createQueue, createWorker } from "@/shared/lib/queue";
import { logger } from "@/shared/lib/logger";
import { AttemptService } from "../services/attempt.service";

const QUEUE_NAME = "assessment-auto-submit";
const REPEAT_JOB_ID = "assessment-auto-submit-repeat";
const EVERY_MS = 60 * 1000;

let queue: Queue | null = null;
let worker: Worker | null = null;

export async function startAssessmentAutoSubmitJob(): Promise<void> {
  queue = createQueue(QUEUE_NAME);

  worker = createWorker(QUEUE_NAME, async () => {
    const { terminated, autoSubmitted } =
      await AttemptService.runAutoSubmitSweep();
    if (terminated > 0 || autoSubmitted > 0) {
      logger.info(
        {
          terminated,
          autoSubmitted,
          module: "assessments",
          action: "ASSESSMENT_AUTO_SUBMIT",
        },
        "Auto-submitted/terminated assessment attempts",
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

export async function stopAssessmentAutoSubmitJob(): Promise<void> {
  await worker?.close();
  await queue?.close();
}
