import { Queue, Worker, Processor } from "bullmq";
import { getRedisClient } from "@/shared/lib/redis";
import { logger } from "@/shared/lib/logger";

export function createQueue(name: string): Queue {
  return new Queue(name, { connection: getRedisClient() });
}

export function createWorker<T = unknown, R = unknown>(
  name: string,
  processor: Processor<T, R>,
): Worker<T, R> {
  const worker = new Worker<T, R>(name, processor, {
    connection: getRedisClient(),
  });

  worker.on("failed", (job, error) => {
    logger.error({ jobId: job?.id, error }, `Job failed in queue: ${name}`);
  });

  return worker;
}
