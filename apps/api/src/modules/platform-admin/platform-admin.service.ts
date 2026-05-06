import { prisma } from '@beaconu/db';
import { CryptoUtils } from '@/shared/utils';
import { UnauthorizedError, ForbiddenError } from '@/shared/errors';
import { SessionManager } from '../auth/auth.session';
import { JwtUtils } from '../auth/auth.jwt';
import { PlatformAdminLoginData } from './platform-admin.schema';
import { USER_TYPES, ACCOUNT_STATUS } from '@/shared/constants';

export class PlatformAdminService {
  static async login(data: PlatformAdminLoginData) {
    const admin = await prisma.platformAdmin.findUnique({
      where: { email: data.email },
    });

    if (!admin) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await CryptoUtils.compare(data.password, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (admin.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new ForbiddenError(`Account is ${admin.status}`);
    }

    // Update last login
    await prisma.platformAdmin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session
    const session = await SessionManager.createSession({
      userId: admin.id,
      userType: USER_TYPES.PLATFORM_ADMIN,
    });

    const accessToken = JwtUtils.generateAccessToken({
      userId: admin.id,
      userType: USER_TYPES.PLATFORM_ADMIN,
      permissions: ['*'], // Full access for platform admins
      sessionId: session.sessionId,
    });

    return {
      user: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
      },
      tokens: {
        accessToken,
        refreshToken: session.refreshToken,
      },
    };
  }

  static async getAllProfiles() {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        status: true,
        createdAt: true,
      },
    });

    const blinkUsers = await prisma.blinkUser.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        status: true,
        agencyName: true,
        createdAt: true,
      },
    });

    return {
      students,
      blinkUsers,
    };
  }
}
