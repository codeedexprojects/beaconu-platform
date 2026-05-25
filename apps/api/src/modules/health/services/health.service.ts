import { checkDatabase } from "@/modules/health/repositories/health.repository";
import { getRedisClient } from "@/shared/lib/redis";

interface HealthStatus {
  status: "ok" | "degraded";
  timestamp: string;
  uptime: number;
  database: "connected" | "disconnected";
  redis: "connected" | "disconnected";
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const [dbHealthy, redisHealthy] = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ]);

  return {
    status: dbHealthy && redisHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: dbHealthy ? "connected" : "disconnected",
    redis: redisHealthy ? "connected" : "disconnected",
  };
}

async function checkRedis(): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const result = await redis.ping();
    return result === "PONG";
  } catch {
    return false;
  }
}
