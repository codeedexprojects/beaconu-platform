import { getRedisClient } from "@/shared/lib/redis";
import { TooManyRequestsError } from "@/shared/errors";

const MESSAGE_WINDOW_SECS = 60;
const MESSAGE_LIMIT_PER_WINDOW = 30;

/** Fixed-window counter, keyed per sender — cheap and sufficient here since
 * chat has no existing rate-limit infra to plug into (none exists anywhere
 * in this codebase yet). Nothing else about `sendMessage` needs this to be
 * a sliding window: the cost of an occasional slightly-early reset at a
 * window boundary is negligible against what this guards — unbounded DB
 * writes, push-notification calls, and Redis fan-out per message with zero
 * throttling today. */
export async function assertChatMessageRateLimit(
  senderType: "student" | "blink_ambassador",
  senderId: string,
): Promise<void> {
  const redis = getRedisClient();
  const key = `chat:rate-limit:${senderType}:${senderId}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, MESSAGE_WINDOW_SECS);
  }
  if (count > MESSAGE_LIMIT_PER_WINDOW) {
    throw new TooManyRequestsError(
      "You're sending messages too quickly. Please wait a moment and try again.",
    );
  }
}
