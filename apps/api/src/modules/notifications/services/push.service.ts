import { messaging, isFirebaseReady } from "@/shared/lib/firebase";
import { logger } from "@/shared/lib/logger";
import { NotificationsRepository } from "../repositories/notifications.repository";

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export interface PushResult {
  sentCount: number;
  failedCount: number;
  totalTokens: number;
}

const STALE_TOKEN_ERRORS = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

export class PushService {
  static async sendToUser(
    userId: string,
    userType: string,
    payload: PushPayload,
  ): Promise<PushResult> {
    const entries = await NotificationsRepository.getActiveFcmTokens(
      userId,
      userType,
    );

    if (entries.length === 0) {
      logger.info({
        action: "PUSH_NO_TOKENS",
        module: "notifications",
        userId,
        userType,
      });
      return { sentCount: 0, failedCount: 0, totalTokens: 0 };
    }

    return PushService.sendToEntries(entries, payload);
  }

  static async sendToTokens(
    tokens: string[],
    payload: PushPayload,
  ): Promise<PushResult> {
    const entries = tokens.map((token) => ({ sessionId: "", token }));
    return PushService.sendToEntries(entries, payload);
  }

  private static async sendToEntries(
    entries: { sessionId: string; token: string }[],
    payload: PushPayload,
  ): Promise<PushResult> {
    if (!isFirebaseReady()) {
      logger.warn({
        action: "PUSH_FIREBASE_NOT_READY",
        module: "notifications",
        tokenCount: entries.length,
        title: payload.title,
        message: "Firebase not configured — notification not sent",
      });
      return {
        sentCount: 0,
        failedCount: entries.length,
        totalTokens: entries.length,
      };
    }

    const tokens = entries.map((e) => e.token);

    const response = await messaging!.sendEachForMulticast({
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
      },
      ...(payload.data ? { data: payload.data } : {}),
    });

    if (response.failureCount > 0) {
      // Group error codes so we can diagnose why tokens are failing
      const errorCounts: Record<string, number> = {};
      const staleSessionIds: string[] = [];

      response.responses.forEach(
        (r: { success: boolean; error?: { code: string } }, i: number) => {
          if (r.success) return;
          const code = r.error?.code ?? "unknown";
          errorCounts[code] = (errorCounts[code] ?? 0) + 1;
          if (STALE_TOKEN_ERRORS.has(code) && entries[i].sessionId) {
            staleSessionIds.push(entries[i].sessionId);
          }
        },
      );

      logger.warn({
        action: "PUSH_FAILURES",
        module: "notifications",
        failedCount: response.failureCount,
        errorCounts,
      });

      if (staleSessionIds.length > 0) {
        await NotificationsRepository.clearFcmTokens(staleSessionIds);
        logger.info({
          action: "PUSH_STALE_TOKENS_CLEARED",
          module: "notifications",
          count: staleSessionIds.length,
        });
      }
    }

    logger.info({
      action: "PUSH_SENT",
      module: "notifications",
      totalTokens: tokens.length,
      sentCount: response.successCount,
      failedCount: response.failureCount,
    });

    return {
      sentCount: response.successCount,
      failedCount: response.failureCount,
      totalTokens: tokens.length,
    };
  }
}
