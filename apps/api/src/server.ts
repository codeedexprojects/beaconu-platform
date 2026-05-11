import { env } from "@/shared/config/env";
import app from "@/app";
import { getRedisClient, disconnectRedis } from "@/shared/lib/redis";
import { prisma } from "@beaconu/db";
import { logger } from "@/shared/lib/logger";

async function startServer(): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.ping();
    logger.info("Redis connected successfully");

    await prisma.$connect();
    logger.info("Database connected successfully");

    const server = app.listen(env.PORT, () => {
      logger.info(
        { port: env.PORT, env: env.NODE_ENV },
        `BeaconU API running on port ${env.PORT}`,
      );
    });

    const shutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, "Graceful shutdown initiated");
      server.close(async () => {
        await disconnectRedis();
        await prisma.$disconnect();
        logger.info("Server shut down cleanly");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
}
// #test
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer().catch((error) => {
    console.error("Unhandled server startup error:", error);
    process.exit(1);
  });
}
