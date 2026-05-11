import Redis from "ioredis";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/lib/logger";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    });

    redisClient.on("error", (error) => {
      logger.error({ error }, "Redis connection error");
    });

    redisClient.on("connect", () => {
      logger.info("Redis connected");
    });
  }
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
