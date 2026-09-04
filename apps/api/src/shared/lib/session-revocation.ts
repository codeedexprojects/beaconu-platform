import { getRedisClient } from "@/shared/lib/redis";
import { logger } from "@/shared/lib/logger";

const REVOKED_KEY_PREFIX = "session:revoked:";
// Matches ACCESS_TOKEN_EXPIRY ("90d") — the revocation marker only needs to
// outlive the longest-lived access token that could still reference this
// session; once it would have expired naturally, the marker is redundant.
const REVOCATION_TTL_SECONDS = 90 * 24 * 60 * 60;

/** Marks a session as revoked so `authenticate` rejects its access token on
 * the very next request, instead of only blocking the next refresh (see
 * UserSession.isActive, which alone doesn't stop an already-issued
 * long-lived access token from continuing to work). Call this alongside
 * flipping UserSession.isActive to false, never instead of it. */
export async function markSessionRevoked(sessionId: string): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.set(
      `${REVOKED_KEY_PREFIX}${sessionId}`,
      "1",
      "EX",
      REVOCATION_TTL_SECONDS,
    );
  } catch (error) {
    logger.error(
      { err: error, sessionId },
      "Failed to write session revocation marker to Redis",
    );
    throw error;
  }
}

/** Returns true if this session has been force-revoked. Fails open (treats
 * Redis errors as "not revoked") so a transient Redis outage degrades to
 * today's behavior — session-based revocation stops working, but normal
 * authentication is not blocked platform-wide by an infra hiccup. */
export async function isSessionRevoked(sessionId: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const value = await redis.get(`${REVOKED_KEY_PREFIX}${sessionId}`);
    return value === "1";
  } catch (error) {
    logger.error(
      { err: error, sessionId },
      "Failed to read session revocation marker from Redis — failing open",
    );
    return false;
  }
}
