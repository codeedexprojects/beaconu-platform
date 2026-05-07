import { BlinkRepository } from './blink.repository';
import { CryptoUtils } from '@/shared/utils';
import { ConflictError, UnauthorizedError, ForbiddenError, NotFoundError } from '@/shared/errors';
import { prisma } from '@beaconu/db';
import { SessionManager } from '../auth/auth.session';
import { JwtUtils } from '../auth/auth.jwt';
import { CreateBlinkUserData, BlinkLoginData } from './blink.types';
import { USER_TYPES, ACCOUNT_STATUS } from '@/shared/constants';

export class BlinkService {
  static async register(data: CreateBlinkUserData) {
    // 1. Check if email/reg number unique
    const existingEmail = await BlinkRepository.findByEmail(data.agency_email);
    if (existingEmail) throw new ConflictError('Email already exists');

    const existingReg = await BlinkRepository.findByRegNumber(data.agency_reg_number);
    if (existingReg) throw new ConflictError('Agency registration number already exists');

    // 2. Hash password
    const passwordHash = await CryptoUtils.hash(data.password);

    // 3. Get associate_admin role ID
    const role = await prisma.blinkRole.findUnique({
      where: { slug: 'associate_admin' },
    });
    if (!role) throw new Error('System role associate_admin not found');

    // 4. Create user
    const user = await BlinkRepository.create({
      agencyName: data.agency_name,
      agencyEmail: data.agency_email,
      agencyRegNumber: data.agency_reg_number,
      agencyPhoneNo: data.agency_phone_no,
      country: data.country,
      passwordHash,
      roleId: role.id,
    });

    // 5. Create session
    const session = await SessionManager.createSession({
      userId: user.id,
      userType: USER_TYPES.BLINK,
    });

    // 6. Generate access token
    const accessToken = JwtUtils.generateAccessToken({
      userId: user.id,
      userType: USER_TYPES.BLINK,
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

    // Reject suspended/inactive/pending
    if (user.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new ForbiddenError(`Account is ${user.status}`);
    }

    // Update last login
    await BlinkRepository.updateLastLogin(user.id);

    // Create session
    const session = await SessionManager.createSession({
      userId: user.id,
      userType: USER_TYPES.BLINK,
    });

    const accessToken = JwtUtils.generateAccessToken({
      userId: user.id,
      userType: USER_TYPES.BLINK,
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
