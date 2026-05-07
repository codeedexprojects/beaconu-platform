import { prisma } from '@beaconu/db';
import { UnauthorizedError } from '@/shared/errors';
import { JwtUtils } from './auth.jwt';
import { SessionManager } from './auth.session';
import { TokenResponse, UserType } from './auth.types';
import { USER_TYPES } from '@/shared/constants';

export class AuthService {
  static async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    const session = await SessionManager.validateSession(refreshToken);
    
    if (!session) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    try {
      JwtUtils.verifyRefreshToken(refreshToken);
      
      // Fetch user data to get current roles/permissions
      const userData = await this.getUnifiedUser(session.userId, session.userType as UserType);
      
      if (!userData) {
        throw new UnauthorizedError('User not found');
      }

      // Rotate session
      const newSession = await SessionManager.rotateSession(refreshToken, {
        userId: session.userId,
        userType: session.userType as UserType,
        ipAddress: session.ipAddress || undefined,
        deviceInfo: session.deviceInfo,
      });

      const accessToken = JwtUtils.generateAccessToken({
        userId: session.userId,
        userType: session.userType as UserType,
        roleId: userData.roleId,
        collegeId: userData.collegeId,
        permissions: userData.permissions,
        sessionId: newSession.sessionId,
      });

      return {
        accessToken,
        refreshToken: newSession.refreshToken,
      };
    } catch {
      await SessionManager.invalidateSession(refreshToken);
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  static async logout(refreshToken: string): Promise<void> {
    await SessionManager.invalidateSession(refreshToken);
  }

  private static async getUnifiedUser(userId: string, userType: UserType) {
    switch (userType) {
      case USER_TYPES.BLINK: {
        const blinkUser = await prisma.blinkUser.findUnique({
          where: { id: userId },
          include: { blinkRole: true },
        });
        return blinkUser ? {
          roleId: blinkUser.blinkRoleId,
          collegeId: blinkUser.collegeId || undefined,
          permissions: [], // Blink roles might have permissions later
        } : null;
      }

      case USER_TYPES.STAFF: {
        const staff = await prisma.staffMember.findUnique({
          where: { id: userId },
          include: { 
            collegeRole: {
              include: { permissions: true }
            }
          },
        });
        return staff ? {
          roleId: staff.collegeRoleId,
          collegeId: staff.collegeId,
          permissions: staff.collegeRole.permissions.map(p => p.permissionCode),
        } : null;
      }

      case USER_TYPES.PLATFORM_ADMIN: {
        const admin = await prisma.platformAdmin.findUnique({
          where: { id: userId },
        });
        return admin ? {
          roleId: undefined,
          collegeId: undefined,
          permissions: ['*'], // Super admin
        } : null;
      }

      case USER_TYPES.STUDENT: {
        const student = await prisma.student.findUnique({
          where: { id: userId },
        });
        return student ? {
          roleId: undefined,
          collegeId: undefined,
          permissions: [],
        } : null;
      }

      default:
        return null;
    }
  }
}
