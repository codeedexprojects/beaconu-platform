import { BlinkRepository } from './blink.repository';
import { CryptoUtils } from '@/shared/utils';
import { ConflictError, UnauthorizedError, ForbiddenError, NotFoundError } from '@/shared/errors';
import { prisma } from '@beaconu/db';
import { SessionManager } from '../auth/auth.session';
import { JwtUtils } from '../auth/auth.jwt';
import { CreateBlinkUserData, BlinkLoginData } from './blink.types';
import { USER_TYPES, ACCOUNT_STATUS } from '@/shared/constants';
import { UserType } from '../auth/auth.types';

export class BlinkService {
  static async register(data: CreateBlinkUserData) {
    const existingEmail = await BlinkRepository.findByEmail(data.agency_email);
    if (existingEmail) throw new ConflictError('Email already exists');

    const existingReg = await BlinkRepository.findByRegNumber(data.agency_reg_number);
    if (existingReg) throw new ConflictError('Agency registration number already exists');

    const passwordHash = await CryptoUtils.hash(data.password);

    const role = await prisma.blinkRole.findUnique({
      where: { slug: 'associate_admin' },
    });
    if (!role) throw new Error('System role associate_admin not found');

    const user = await BlinkRepository.create({
      agencyName: data.agency_name,
      agencyEmail: data.agency_email,
      agencyRegNumber: data.agency_reg_number,
      agencyPhoneNo: data.agency_phone_no,
      country: data.country,
      passwordHash,
      roleId: role.id,
    });

    const session = await SessionManager.createSession({
      userId: user.id,
      userType: USER_TYPES.BLINK as UserType,
    });

    const accessToken = JwtUtils.generateAccessToken({
      userId: user.id,
      userType: USER_TYPES.BLINK as UserType,
      roleId: user.blinkRoleId,
      sessionId: session.sessionId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        agencyName: user.agencyName,
      },
      tokens: {
        accessToken,
        refreshToken: session.refreshToken,
      },
    };
  }

  static async login(data: BlinkLoginData) {
    const user = await BlinkRepository.findByEmail(data.agency_email);
    if (!user) throw new UnauthorizedError('Invalid credentials');

    if (user.agencyRegNumber !== data.agency_reg_number) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await CryptoUtils.compare(data.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedError('Invalid credentials');

    if (user.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new ForbiddenError(`Account is ${user.status}`);
    }

    await BlinkRepository.updateLastLogin(user.id);

    const session = await SessionManager.createSession({
      userId: user.id,
      userType: USER_TYPES.BLINK as UserType,
    });

    const accessToken = JwtUtils.generateAccessToken({
      userId: user.id,
      userType: USER_TYPES.BLINK as UserType,
      roleId: user.blinkRoleId,
      sessionId: session.sessionId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        agencyName: user.agencyName,
      },
      tokens: {
        accessToken,
        refreshToken: session.refreshToken,
      },
    };
  }

  static async getProfile(userId: string) {
    const user = await BlinkRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }
}
