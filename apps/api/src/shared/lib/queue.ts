import Redis from "ioredis";
import { Queue, Worker, Processor } from "bullmq";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/lib/logger";

function createBullConnection(): Redis {
  return new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

export function createQueue(name: string): Queue {
  return new Queue(name, { connection: createBullConnection() });
}

export function createWorker<T = unknown, R = unknown>(
  name: string,
  processor: Processor<T, R>,
): Worker<T, R> {
  const worker = new Worker<T, R>(name, processor, {
    connection: createBullConnection(),
  });

  worker.on("failed", (job, error) => {
    logger.error({ jobId: job?.id, error }, `Job failed in queue: ${name}`);
  });

  return worker;
}
