import { prisma } from '@beaconu/db';
import type { Prisma } from '@beaconu/db';
import { CryptoUtils } from '@/shared/utils';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '@/shared/errors';
import { ACCOUNT_STATUS, USER_TYPES } from '@/shared/constants';
import {
  BLINK_ROLE_PERMISSIONS,
  BLINK_ROLES,
} from '@/modules/blink/blink.permissions';
import { JwtUtils } from '../auth.jwt';
import { AuthRepository } from '../repositories/auth.repository';
import { UserType, TokenResponse } from '../auth.types';
import {
  LoginInput,
  PlatformLoginInput,
  RegisterCounsellorInput,
  RegisterAssociateAdminInput,
} from '../validators/auth.validator';

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

export class AuthService {
  static async loginBlink(data: LoginInput) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const blinkUser = await prisma.blinkUser.findUnique({
      where: { email: normalizedEmail },
      include: { blinkRole: true },
    });

    if (!blinkUser) throw new UnauthorizedError("Invalid credentials");

    const isMatch = await CryptoUtils.compare(
      data.password,
      blinkUser.passwordHash,
    );
    if (!isMatch) throw new UnauthorizedError('Invalid credentials');
    if (blinkUser.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new ForbiddenError(`Account is ${blinkUser.status}`);
    }

    const userType = getBlinkUserType(blinkUser.blinkRole.slug);
    const permissions = BLINK_ROLE_PERMISSIONS[blinkUser.blinkRole.slug] ?? [];
    const session = await AuthRepository.createSession({
      userId: blinkUser.id,
      userType,
    });

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
      tokens: { accessToken, refreshToken: session.refreshToken },
    };
  }

  static async loginCounsellor(data: LoginInput) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const counsellor = await prisma.counsellor.findUnique({
      where: { email: normalizedEmail },
    });

    if (!counsellor) throw new UnauthorizedError("Invalid credentials");

    const isMatch = await CryptoUtils.compare(
      data.password,
      counsellor.passwordHash,
    );
    if (!isMatch) throw new UnauthorizedError('Invalid credentials');
    if (counsellor.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new ForbiddenError(`Account is ${counsellor.status}`);
    }

    const session = await AuthRepository.createSession({
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
      tokens: { accessToken, refreshToken: session.refreshToken },
    };
  }

  static async registerCounsellor(data: RegisterCounsellorInput) {
    const existing = await prisma.counsellor.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictError('Email already exists');

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

    const session = await AuthRepository.createSession({
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
      tokens: { accessToken, refreshToken: session.refreshToken },
    };
  }

  static async registerAssociateAdmin(data: RegisterAssociateAdminInput) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingEmail = await prisma.blinkUser.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) throw new ConflictError('Email already exists');

    const existingReg = await prisma.blinkUser.findFirst({
      where: { agencyRegNumber: data.agency_reg_number },
    });
    if (existingReg)
      throw new ConflictError('Agency registration number already exists');

    const role = await prisma.blinkRole.findUnique({
      where: { slug: BLINK_ROLES.ASSOCIATE_ADMIN },
    });
    if (!role) throw new NotFoundError('Blink role not found');

    const passwordHash = await CryptoUtils.hash(data.password);

    const user = await prisma.blinkUser.create({
      data: {
        fullName: data.full_name,
        email: normalizedEmail,
        passwordHash,
        phoneNumber: data.phone_number,
        country: data.country,
        agencyName: data.agency_name,
        agencyRegNumber: data.agency_reg_number,
        blinkRoleId: role.id,
        status: ACCOUNT_STATUS.ACTIVE,
      },
      include: { blinkRole: true },
    });

    const userType = USER_TYPES.BLINK_ASSOCIATE as UserType;
    const permissions = BLINK_ROLE_PERMISSIONS[user.blinkRole.slug] ?? [];
    const session = await AuthRepository.createSession({
      userId: user.id,
      userType,
    });

    const accessToken = JwtUtils.generateAccessToken({
      userId: user.id,
      userType,
      roleId: user.blinkRoleId,
      permissions,
      sessionId: session.sessionId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        agencyName: user.agencyName,
        roleSlug: user.blinkRole.slug,
      },
      tokens: { accessToken, refreshToken: session.refreshToken },
    };
  }

  static async loginPlatformAdmin(data: PlatformLoginInput) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedRoleSlug = data.role_slug.trim().toLowerCase();

    const admin = await prisma.platformAdmin.findUnique({
      where: { email: normalizedEmail },
      include: { platformRole: { include: { permissions: true } } },
    });

    if (!admin) throw new UnauthorizedError("Invalid credentials");

    const isMatch = await CryptoUtils.compare(
      data.password,
      admin.passwordHash,
    );
    if (!isMatch) throw new UnauthorizedError('Invalid credentials');

    if (!admin.platformRole || admin.platformRole.slug !== normalizedRoleSlug) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (admin.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new ForbiddenError(`Account is ${admin.status}`);
    }

    if (!admin.platformRole) throw new NotFoundError("Platform role not found");

    await prisma.platformAdmin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const session = await AuthRepository.createSession({
      userId: admin.id,
      userType: USER_TYPES.PLATFORM_ADMIN,
    });

    const rolePermissions = admin.platformRole.permissions.map(
      (p) => p.permissionCode,
    );
    const permissions = rolePermissions.includes('*') ? ['*'] : rolePermissions;

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
      tokens: { accessToken, refreshToken: session.refreshToken },
    };
  }

  static async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token missing');
    }

    console.log(refreshToken)

    const session = await AuthRepository.findSession(refreshToken);
    if (!session)
      throw new UnauthorizedError('Invalid or expired refresh token');

    try {
      JwtUtils.verifyRefreshToken(refreshToken);

      const userData = await this.getUserForRefresh(
        session.userId,
        session.userType as UserType,
      );
      if (!userData) throw new UnauthorizedError('User not found');

      const newSession = await AuthRepository.rotateSession(refreshToken, {
        userId: session.userId,
        userType: session.userType as UserType,
        ipAddress: session.ipAddress || undefined,
        deviceInfo:
          session.deviceInfo === null
            ? undefined
            : (session.deviceInfo as Prisma.InputJsonValue),
      });

      const accessToken = JwtUtils.generateAccessToken({
        userId: session.userId,
        userType: session.userType as UserType,
        roleId: userData.roleId,
        collegeId: userData.collegeId,
        permissions: userData.permissions,
        sessionId: newSession.sessionId,
      });

      return { accessToken, refreshToken: newSession.refreshToken };
    } catch {
      await AuthRepository.invalidateSession(refreshToken);
      throw new UnauthorizedError("Invalid refresh token");
    }
  }

  static async logout(refreshToken: string): Promise<void> {
    await AuthRepository.invalidateSession(refreshToken);
  }

  private static async getUserForRefresh(userId: string, userType: UserType) {
    switch (userType) {
      case USER_TYPES.BLINK_ASSOCIATE:
      case USER_TYPES.BLINK_EMPLOYEE:
      case USER_TYPES.BLINK_AMBASSADOR: {
        const blinkUser = await prisma.blinkUser.findUnique({
          where: { id: userId },
          include: { blinkRole: true },
        });
        return blinkUser
          ? {
              roleId: blinkUser.blinkRoleId,
              collegeId: blinkUser.collegeId || undefined,
              permissions:
                BLINK_ROLE_PERMISSIONS[blinkUser.blinkRole.slug] || [],
            }
          : null;
      }

      case USER_TYPES.STAFF: {
        const staff = await prisma.staffMember.findUnique({
          where: { id: userId },
          include: { collegeRole: { include: { permissions: true } } },
        });
        return staff
          ? {
              roleId: staff.collegeRoleId,
              collegeId: staff.collegeId,
              permissions: staff.collegeRole.permissions.map(
                (p) => p.permissionCode,
              ),
            }
          : null;
      }

      case USER_TYPES.PLATFORM_ADMIN: {
        const admin = await prisma.platformAdmin.findUnique({
          where: { id: userId },
          include: { platformRole: { include: { permissions: true } } },
        });
        const rolePermissions =
          admin?.platformRole?.permissions.map((p) => p.permissionCode) || [];
        const permissions = rolePermissions.includes('*')
          ? ['*']
          : rolePermissions;
        return admin
          ? {
              roleId: admin.platformRoleId || undefined,
              collegeId: undefined,
              permissions,
            }
          : null;
      }

      case USER_TYPES.STUDENT: {
        const student = await prisma.student.findUnique({
          where: { id: userId },
        });
        return student
          ? { roleId: undefined, collegeId: undefined, permissions: [] }
          : null;
      }

      case USER_TYPES.COUNSELLOR: {
        const counsellor = await prisma.counsellor.findUnique({
          where: { id: userId },
        });
        return counsellor
          ? { roleId: undefined, collegeId: undefined, permissions: [] }
          : null;
      }

      default:
        return null;
    }
  }
}
