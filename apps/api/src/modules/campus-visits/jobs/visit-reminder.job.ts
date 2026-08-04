import { Queue, Worker } from "bullmq";
import { createQueue, createWorker } from "@/shared/lib/queue";
import { logger } from "@/shared/lib/logger";
import { CampusVisitsService } from "../services/campus-visits.service";

const QUEUE_NAME = "campus-visit-reminder";
const REPEAT_JOB_ID = "campus-visit-reminder-repeat";
const EVERY_MS = 5 * 60 * 1000;

let queue: Queue | null = null;
let worker: Worker | null = null;

export async function startVisitReminderJob(): Promise<void> {
  queue = createQueue(QUEUE_NAME);

  worker = createWorker(QUEUE_NAME, async () => {
    const count = await CampusVisitsService.sendUpcomingVisitReminders();
    if (count > 0) {
      logger.info(
        { count, module: "campus-visits", action: "VISIT_REMINDER_SENT" },
        "Sent campus visit reminders (24-hour / 1-hour)",
      );
    }

    const rebroadcastCount =
      await CampusVisitsService.rebroadcastStaleArrivals();
    if (rebroadcastCount > 0) {
      logger.info(
        {
          count: rebroadcastCount,
          module: "campus-visits",
          action: "VISIT_ARRIVAL_REBROADCAST",
        },
        "Re-notified ambassadors of unclaimed arrived campus visits",
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

export async function stopVisitReminderJob(): Promise<void> {
  await worker?.close();
  await queue?.close();
}
