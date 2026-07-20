import { prisma } from "@beaconu/db";

function dedupeTokens(
  sessions: { id: string; deviceInfo: unknown }[],
): { sessionId: string; token: string }[] {
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

    return dedupeTokens(sessions);
  }

  static async getActiveFcmTokensForUsers(
    recipients: { userId: string; userType: string }[],
  ): Promise<{ sessionId: string; token: string }[]> {
    if (recipients.length === 0) return [];

    const sessions = await prisma.userSession.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: new Date() },
        OR: recipients.map((r) => ({ userId: r.userId, userType: r.userType })),
      },
      select: { id: true, deviceInfo: true },
    });

    return dedupeTokens(sessions);
  }

  static async clearFcmTokens(sessionIds: string[]): Promise<void> {
    if (sessionIds.length === 0) return;
    await prisma.userSession.updateMany({
      where: { id: { in: sessionIds } },
      data: { deviceInfo: {} },
    });
  }
}
