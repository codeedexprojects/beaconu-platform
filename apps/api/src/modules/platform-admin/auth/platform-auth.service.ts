import { prisma } from '@beaconu/db';
import { CryptoUtils } from '@/shared/utils';
import { UnauthorizedError, ForbiddenError } from '@/shared/errors';
import { SessionManager } from '../../auth/auth.session';
import { JwtUtils } from '../../auth/auth.jwt';
import { PlatformAdminLoginData } from './platform-auth.schema';
import { USER_TYPES, ACCOUNT_STATUS } from '@/shared/constants';

export class PlatformAuthService {
  static async login(data: PlatformAdminLoginData) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedRoleSlug = data.role_slug.trim().toLowerCase();

    const admin = await prisma.platformAdmin.findUnique({
      where: { email: normalizedEmail },
      include: {
        platformRole: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!admin) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await CryptoUtils.compare(data.password, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!admin.platformRole || admin.platformRole.slug !== normalizedRoleSlug) {
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

    const rolePermissions = admin.platformRole.permissions.map((permission) => permission.permissionCode);
    const permissions = rolePermissions.includes('*')
      ? ['*']
      : rolePermissions;

    const accessToken = JwtUtils.generateAccessToken({
      userId: admin.id,
      userType: USER_TYPES.PLATFORM_ADMIN,
      roleId: admin.platformRoleId || undefined,
      permissions,
      sessionId: session.sessionId,
    });

    return {
      user: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        roleSlug: admin.platformRole.slug,
      },
      tokens: {
        accessToken,
        refreshToken: session.refreshToken,
      },
    };
  }
}
