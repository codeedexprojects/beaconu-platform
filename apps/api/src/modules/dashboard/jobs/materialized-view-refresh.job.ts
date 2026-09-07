import { Queue, Worker } from "bullmq";
import { createQueue, createWorker } from "@/shared/lib/queue";
import { logger } from "@/shared/lib/logger";
import { ReportsMaterializedViewsRepository } from "../repositories/reports-materialized-views.repository";

const QUEUE_NAME = "materialized-view-refresh";
const REPEAT_JOB_ID = "materialized-view-refresh-repeat";
const EVERY_MS = 15 * 60 * 1000;

let queue: Queue | null = null;
let worker: Worker | null = null;

export async function startMaterializedViewRefreshJob(): Promise<void> {
  queue = createQueue(QUEUE_NAME);

  worker = createWorker(QUEUE_NAME, async () => {
    const results = await ReportsMaterializedViewsRepository.refreshAll();
    logger.info(
      {
        module: "dashboard",
        action: "MATERIALIZED_VIEWS_REFRESHED",
        views: results,
      },
      "Refreshed report materialized views",
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

export async function stopMaterializedViewRefreshJob(): Promise<void> {
  await worker?.close();
  await queue?.close();
}
