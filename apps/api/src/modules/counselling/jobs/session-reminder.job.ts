import { Queue, Worker } from "bullmq";
import { createQueue, createWorker } from "@/shared/lib/queue";
import { logger } from "@/shared/lib/logger";
import { SessionService } from "../services/sessions.service";

const QUEUE_NAME = "counselling-session-reminder";
const REPEAT_JOB_ID = "session-reminder-repeat";
const EVERY_MS = 60 * 1000;

let queue: Queue | null = null;
let worker: Worker | null = null;

export async function startSessionReminderJob(): Promise<void> {
  queue = createQueue(QUEUE_NAME);

  worker = createWorker(QUEUE_NAME, async () => {
    const count = await SessionService.sendSessionReminders();
    if (count > 0) {
      logger.info(
        { count, module: "counselling", action: "SESSION_REMINDER_SENT" },
        "Sent 10-minute session reminders",
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

export async function stopSessionReminderJob(): Promise<void> {
  await worker?.close();
  await queue?.close();
}
