import { prisma } from '@beaconu/db';
import { CryptoUtils } from '@/shared/utils';
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from '@/shared/errors';
import { ACCOUNT_STATUS, USER_TYPES } from '@/shared/constants';
import { SessionManager } from './auth.session';
import { JwtUtils } from './auth.jwt';
import { BLINK_ROLE_PERMISSIONS, BLINK_ROLES } from '../blink/blink.permissions';
import { RegisterCounsellorData, UnifiedLoginData } from './auth-unified.schema';
import { UserType } from './auth.types';

function getBlinkUserType(roleSlug: string): UserType {
  switch (roleSlug) {
    case BLINK_ROLES.ASSOCIATE_ADMIN:
      return USER_TYPES.BLINK_ASSOCIATE as UserType;
    case BLINK_ROLES.ASSOCIATE_EMPLOYEE:
      return USER_TYPES.BLINK_EMPLOYEE as UserType;
    case BLINK_ROLES.CAMPUS_AMBASSADOR:
      return USER_TYPES.BLINK_AMBASSADOR as UserType;
    default:
      return USER_TYPES.BLINK_ASSOCIATE as UserType;
  }
}

export class UnifiedAuthService {
  static async registerCounsellor(data: RegisterCounsellorData) {
    const existing = await prisma.counsellor.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictError('Email already exists');
    }

    const passwordHash = await CryptoUtils.hash(data.password);

    const counsellor = await prisma.counsellor.create({
      data: {
        fullName: data.full_name,
        email: data.email,
        passwordHash,
        phoneNumber: data.phone_number,
        counsellorType: data.counsellor_type,
        status: ACCOUNT_STATUS.ACTIVE,
      },
    });

    const session = await SessionManager.createSession({
      userId: counsellor.id,
      userType: USER_TYPES.COUNSELLOR,
    });

    const accessToken = JwtUtils.generateAccessToken({
      userId: counsellor.id,
      userType: USER_TYPES.COUNSELLOR,
      permissions: [],
      sessionId: session.sessionId,
    });

    return {
      user: {
        id: counsellor.id,
        email: counsellor.email,
        fullName: counsellor.fullName,
        counsellorType: counsellor.counsellorType,
      },
      tokens: {
        accessToken,
        refreshToken: session.refreshToken,
      },
    };
  }

  static async login(data: UnifiedLoginData) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const blinkUser = await prisma.blinkUser.findUnique({
      where: { email: normalizedEmail },
      include: { blinkRole: true },
    });

    if (blinkUser) {
      const isMatch = await CryptoUtils.compare(data.password, blinkUser.passwordHash);
      if (!isMatch) throw new UnauthorizedError('Invalid credentials');
      if (blinkUser.status !== ACCOUNT_STATUS.ACTIVE) {
        throw new ForbiddenError(`Account is ${blinkUser.status}`);
      }

      const userType = getBlinkUserType(blinkUser.blinkRole.slug);
      const permissions = BLINK_ROLE_PERMISSIONS[blinkUser.blinkRole.slug] ?? [];
      const session = await SessionManager.createSession({ userId: blinkUser.id, userType });

      await prisma.blinkUser.update({
        where: { id: blinkUser.id },
        data: { lastLoginAt: new Date() },
      });

      const accessToken = JwtUtils.generateAccessToken({
        userId: blinkUser.id,
        userType,
        roleId: blinkUser.blinkRoleId,
        collegeId: blinkUser.collegeId || undefined,
        permissions,
        sessionId: session.sessionId,
      });

      return {
        user: {
          id: blinkUser.id,
          email: blinkUser.email,
          fullName: blinkUser.fullName,
          userType,
          roleSlug: blinkUser.blinkRole.slug,
        },
        tokens: {
          accessToken,
          refreshToken: session.refreshToken,
        },
      };
    }

    const counsellor = await prisma.counsellor.findUnique({
      where: { email: normalizedEmail },
    });

    if (counsellor) {
      const isMatch = await CryptoUtils.compare(data.password, counsellor.passwordHash);
      if (!isMatch) throw new UnauthorizedError('Invalid credentials');
      if (counsellor.status !== ACCOUNT_STATUS.ACTIVE) {
        throw new ForbiddenError(`Account is ${counsellor.status}`);
      }

      const session = await SessionManager.createSession({
        userId: counsellor.id,
        userType: USER_TYPES.COUNSELLOR,
      });

      await prisma.counsellor.update({
        where: { id: counsellor.id },
        data: { lastLoginAt: new Date() },
      });

      const accessToken = JwtUtils.generateAccessToken({
        userId: counsellor.id,
        userType: USER_TYPES.COUNSELLOR,
        permissions: [],
        sessionId: session.sessionId,
      });

      return {
        user: {
          id: counsellor.id,
          email: counsellor.email,
          fullName: counsellor.fullName,
          userType: USER_TYPES.COUNSELLOR,
          counsellorType: counsellor.counsellorType,
        },
        tokens: {
          accessToken,
          refreshToken: session.refreshToken,
        },
      };
    }

    const platformAdmin = await prisma.platformAdmin.findUnique({
      where: { email: normalizedEmail },
      include: {
        platformRole: {
          include: { permissions: true },
        },
      },
    });

    if (platformAdmin) {
      const isMatch = await CryptoUtils.compare(data.password, platformAdmin.passwordHash);
      if (!isMatch) throw new UnauthorizedError('Invalid credentials');
      if (platformAdmin.status !== ACCOUNT_STATUS.ACTIVE) {
        throw new ForbiddenError(`Account is ${platformAdmin.status}`);
      }
      if (!platformAdmin.platformRole) {
        throw new NotFoundError('Platform role not found');
      }

      const session = await SessionManager.createSession({
        userId: platformAdmin.id,
        userType: USER_TYPES.PLATFORM_ADMIN,
      });

      await prisma.platformAdmin.update({
        where: { id: platformAdmin.id },
        data: { lastLoginAt: new Date() },
      });

      const rolePermissions = platformAdmin.platformRole.permissions.map((item) => item.permissionCode);
      const permissions = rolePermissions.includes('*') ? ['*'] : rolePermissions;

      const accessToken = JwtUtils.generateAccessToken({
        userId: platformAdmin.id,
        userType: USER_TYPES.PLATFORM_ADMIN,
        roleId: platformAdmin.platformRoleId || undefined,
        permissions,
        sessionId: session.sessionId,
      });

      return {
        user: {
          id: platformAdmin.id,
          email: platformAdmin.email,
          fullName: platformAdmin.fullName,
          userType: USER_TYPES.PLATFORM_ADMIN,
          roleSlug: platformAdmin.platformRole.slug,
        },
        tokens: {
          accessToken,
          refreshToken: session.refreshToken,
        },
      };
    }

    throw new UnauthorizedError('Invalid credentials');
  }

  static async loginCounsellor(data: UnifiedLoginData) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const counsellor = await prisma.counsellor.findUnique({
      where: { email: normalizedEmail },
    });

    if (!counsellor) {
      throw new UnauthorizedError('Invalid counsellor credentials');
    }

    const isMatch = await CryptoUtils.compare(data.password, counsellor.passwordHash);
    if (!isMatch) throw new UnauthorizedError('Invalid counsellor credentials');
    if (counsellor.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new ForbiddenError(`Account is ${counsellor.status}`);
    }

    const session = await SessionManager.createSession({
      userId: counsellor.id,
      userType: USER_TYPES.COUNSELLOR,
    });

    await prisma.counsellor.update({
      where: { id: counsellor.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = JwtUtils.generateAccessToken({
      userId: counsellor.id,
      userType: USER_TYPES.COUNSELLOR,
      permissions: [],
      sessionId: session.sessionId,
    });

    return {
      user: {
        id: counsellor.id,
        email: counsellor.email,
        fullName: counsellor.fullName,
        userType: USER_TYPES.COUNSELLOR,
        counsellorType: counsellor.counsellorType,
      },
      tokens: {
        accessToken,
        refreshToken: session.refreshToken,
      },
    };
  }
}
