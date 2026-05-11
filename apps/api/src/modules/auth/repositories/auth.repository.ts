import { prisma } from "@beaconu/db";
import type { Prisma } from "@beaconu/db";
import { JwtUtils } from "../auth.jwt";
import { SessionData } from "../auth.types";
import { SESSION_EXPIRY_DAYS } from "@/shared/constants";
import { UnauthorizedError } from "@/shared/errors";

export class AuthRepository {
  static async createSession(data: SessionData) {
    const { userId, userType, deviceInfo, ipAddress } = data;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

    const session = await prisma.userSession.create({
      data: {
        userId,
        userType,
        refreshToken: "PENDING",
        deviceInfo: deviceInfo ?? ({} as Prisma.JsonObject),
        ipAddress,
        expiresAt,
      },
    });

    const refreshToken = JwtUtils.generateRefreshToken({
      userId,
      userType,
      sessionId: session.id,
    });

    await prisma.userSession.update({
      where: { id: session.id },
      data: { refreshToken },
    });

    return { refreshToken, sessionId: session.id };
  }

  static async findSession(refreshToken: string) {
    const session = await prisma.userSession.findUnique({
      where: { refreshToken },
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      if (session && !session.isActive) {
        await this.invalidateAllUserSessions(session.userId, session.userType);
      }
      return null;
    }

    return session;
  }

  static async rotateSession(oldRefreshToken: string, data: SessionData) {
    const oldSession = await this.findSession(oldRefreshToken);
    if (!oldSession) {
      throw new UnauthorizedError("Invalid or expired session");
    }

    await prisma.userSession.update({
      where: { id: oldSession.id },
      data: { isActive: false },
    });

    return this.createSession(data);
  }

  static async invalidateSession(refreshToken: string) {
    await prisma.userSession.updateMany({
      where: { refreshToken, isActive: true },
      data: { isActive: false },
    });
  }

  static async invalidateAllUserSessions(userId: string, userType: string) {
    await prisma.userSession.updateMany({
      where: { userId, userType, isActive: true },
      data: { isActive: false },
    });
  }
}
