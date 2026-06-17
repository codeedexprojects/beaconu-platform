import { prisma } from "@beaconu/db";

export class NotificationsRepository {
  static async getActiveFcmTokens(
    userId: string,
    userType: string,
  ): Promise<{ sessionId: string; token: string }[]> {
    const sessions = await prisma.userSession.findMany({
      where: {
        userId,
        userType,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, deviceInfo: true },
    });

    const seen = new Set<string>();
    return sessions
      .map((s) => {
        const info = s.deviceInfo as Record<string, unknown> | null;
        const token = typeof info?.fcmToken === "string" ? info.fcmToken : null;
        return token && token.length > 0 ? { sessionId: s.id, token } : null;
      })
      .filter((t): t is { sessionId: string; token: string } => {
        if (!t || seen.has(t.token)) return false;
        seen.add(t.token);
        return true;
      });
  }

  static async clearFcmTokens(sessionIds: string[]): Promise<void> {
    if (sessionIds.length === 0) return;
    await prisma.userSession.updateMany({
      where: { id: { in: sessionIds } },
      data: { deviceInfo: {} },
    });
  }
}
