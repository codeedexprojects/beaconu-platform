import { prisma } from '@beaconu/db';
import { SessionData } from './auth.types';
import { JwtUtils } from './auth.jwt';
import { SESSION_EXPIRY_DAYS } from '@/shared/constants';
import { UnauthorizedError } from '@/shared/errors';

export class SessionManager {
  static async createSession(data: SessionData) {
    const { userId, userType, deviceInfo, ipAddress } = data;

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

    // Initial dummy refresh token to get session ID, or create session first
    const session = await prisma.userSession.create({
      data: {
        userId,
        userType,
        refreshToken: 'PENDING', // Will update after generating with session ID
        deviceInfo: (deviceInfo as any) || {},

        ipAddress,
        expiresAt,
      },
    });

    const refreshToken = JwtUtils.generateRefreshToken({
      userId,
      userType,
      sessionId: session.id,
    });

    // Update session with actual token
    await prisma.userSession.update({
      where: { id: session.id },
      data: { refreshToken },
    });

    return {
      refreshToken,
      sessionId: session.id,
    };
  }

  static async validateSession(refreshToken: string) {
    const session = await prisma.userSession.findUnique({
      where: { refreshToken },
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      // Possible reuse attack if token exists but is inactive
      if (session && !session.isActive) {
        await this.invalidateAllUserSessions(session.userId, session.userType);
      }
      return null;
    }

    return session;
  }

  static async rotateSession(oldRefreshToken: string, data: SessionData) {
    const oldSession = await this.validateSession(oldRefreshToken);
    if (!oldSession) {
      throw new UnauthorizedError('Invalid or expired session');
    }

    // Invalidate old session
    await prisma.userSession.update({
      where: { id: oldSession.id },
      data: { isActive: false },
    });

    // Create new session
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
