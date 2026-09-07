import { createServer } from "http";
import { env } from "@/shared/config/env";
import app from "@/app";
import { getRedisClient, disconnectRedis } from "@/shared/lib/redis";
import { prisma } from "@beaconu/db";
import { logger } from "@/shared/lib/logger";
import {
  startBackgroundJobs,
  stopBackgroundJobs,
} from "@/shared/lib/background-jobs";
import {
  initChatSocketServer,
  disconnectAllChatSockets,
  quitChatRedisAdapter,
} from "@/modules/chat/lib/socket-server";

async function startServer(): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.ping();
    logger.info("Redis connected successfully");

    await prisma.$connect();
    logger.info("Database connected successfully");

    await startBackgroundJobs();

    const httpServer = createServer(app);
    initChatSocketServer(httpServer);

    const server = httpServer.listen(env.PORT, "0.0.0.0", () => {
      logger.info(
        { port: env.PORT, env: env.NODE_ENV },
        `BeaconU API running on port ${env.PORT}`,
      );
    });

    const shutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, "Graceful shutdown initiated");
      // Force-kick every chat socket first — server.close()'s callback
      // otherwise never fires while those long-lived connections stay open.
      // Guarded: a throw here must never skip the rest of shutdown below.
      try {
        disconnectAllChatSockets();
      } catch (error) {
        logger.error(
          { error },
          "Failed to disconnect chat sockets during shutdown",
        );
      }
      server.close(async () => {
        // Each step is independently guarded so one failure (e.g. an
        // already-errored Redis connection rejecting on quit()) can't skip
        // the remaining cleanup steps and leave the process hanging.
        try {
          await stopBackgroundJobs();
        } catch (error) {
          logger.error(
            { error },
            "Failed to stop background jobs during shutdown",
          );
        }
        try {
          await quitChatRedisAdapter();
        } catch (error) {
          logger.error(
            { error },
            "Failed to quit chat Redis adapter during shutdown",
          );
        }
        try {
          await disconnectRedis();
        } catch (error) {
          logger.error({ error }, "Failed to disconnect Redis during shutdown");
        }
        try {
          await prisma.$disconnect();
        } catch (error) {
          logger.error(
            { error },
            "Failed to disconnect Prisma during shutdown",
          );
        }
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

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer().catch((error) => {
    console.error("Unhandled server startup error:", error);
    process.exit(1);
  });
}
