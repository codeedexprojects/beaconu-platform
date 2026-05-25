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

export class PushService {
  static async sendToUser(
    userId: string,
    userType: string,
    payload: PushPayload,
  ): Promise<PushResult> {
    const tokens = await NotificationsRepository.getActiveFcmTokens(
      userId,
      userType,
    );

    if (tokens.length === 0) {
      logger.info({
        action: "PUSH_NO_TOKENS",
        module: "notifications",
        userId,
        userType,
      });
      return { sentCount: 0, failedCount: 0, totalTokens: 0 };
    }

    return PushService.sendToTokens(tokens, payload);
  }

  static async sendToTokens(
    tokens: string[],
    payload: PushPayload,
  ): Promise<PushResult> {
    if (!isFirebaseReady()) {
      logger.info({
        action: "PUSH_DEV_MODE",
        module: "notifications",
        tokenCount: tokens.length,
        title: payload.title,
        body: payload.body,
      });
      return {
        sentCount: tokens.length,
        failedCount: 0,
        totalTokens: tokens.length,
      };
    }

    const response = await messaging!.sendEachForMulticast({
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
      },
      ...(payload.data ? { data: payload.data } : {}),
    });

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
