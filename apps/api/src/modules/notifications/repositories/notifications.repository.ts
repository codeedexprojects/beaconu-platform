import { prisma } from "@beaconu/db";

export class NotificationsRepository {
  static async getActiveFcmTokens(
    userId: string,
    userType: string,
  ): Promise<string[]> {
    const sessions = await prisma.userSession.findMany({
      where: {
        userId,
        userType,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      select: { deviceInfo: true },
    });

    return sessions
      .map((s) => {
        const info = s.deviceInfo as Record<string, unknown> | null;
        return typeof info?.fcmToken === "string" ? info.fcmToken : null;
      })
      .filter((t): t is string => t !== null && t.length > 0);
  }
}
