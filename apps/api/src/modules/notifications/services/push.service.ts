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

  static async sendToUsers(
    recipients: { userId: string; userType: string }[],
    payload: PushPayload,
  ): Promise<PushResult> {
    if (recipients.length === 0) {
      return { sentCount: 0, failedCount: 0, totalTokens: 0 };
    }

    const entries =
      await NotificationsRepository.getActiveFcmTokensForUsers(recipients);

    if (entries.length === 0) {
      logger.info({
        action: "PUSH_NO_TOKENS",
        module: "notifications",
        recipientCount: recipients.length,
      });
      return { sentCount: 0, failedCount: 0, totalTokens: 0 };
    }

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

    const results = await Promise.allSettled(
      entries.map((entry) =>
        messaging!.send({
          token: entry.token,
          notification: {
            title: payload.title,
            body: payload.body,
            ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
          },
          ...(payload.data ? { data: payload.data } : {}),
        }),
      ),
    );

    let sentCount = 0;
    let failedCount = 0;
    const errorCounts: Record<string, number> = {};
    const staleSessionIds: string[] = [];

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        sentCount++;
        return;
      }
      failedCount++;
      const err = result.reason as {
        code?: string;
        message?: string;
        errorInfo?: { code: string; message: string };
      };
      const code = err?.errorInfo?.code ?? err?.code ?? "unknown";
      const message = err?.errorInfo?.message ?? err?.message ?? "";
      errorCounts[code] = (errorCounts[code] ?? 0) + 1;

      logger.warn({
        action: "PUSH_TOKEN_FAILED",
        module: "notifications",
        code,
        message,
      });

      if (STALE_TOKEN_ERRORS.has(code) && entries[i].sessionId) {
        staleSessionIds.push(entries[i].sessionId);
      }
    });

    if (staleSessionIds.length > 0) {
      await NotificationsRepository.clearFcmTokens(staleSessionIds);
      logger.info({
        action: "PUSH_STALE_TOKENS_CLEARED",
        module: "notifications",
        count: staleSessionIds.length,
      });
    }

    logger.info({
      action: "PUSH_SENT",
      module: "notifications",
      totalTokens: entries.length,
      sentCount,
      failedCount,
      ...(failedCount > 0 ? { errorCounts } : {}),
    });

    return { sentCount, failedCount, totalTokens: entries.length };
  }
}
