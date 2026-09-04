import type { Prisma } from "@beaconu/db";
import { CryptoUtils } from "@/shared/utils";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/errors";
import { ACCOUNT_STATUS, USER_TYPES } from "@/shared/constants";
import { auth as firebaseAuth } from "@/shared/lib/firebase";
import { markSessionRevoked } from "@/shared/lib/session-revocation";
import {
  BLINK_ROLE_PERMISSIONS,
  BLINK_ROLES,
} from "@/modules/blink/blink.permissions";
import { JwtUtils } from "../auth.jwt";
import { AuthRepository } from "../repositories/auth.repository";
import { CounsellorRequestRepository } from "@/modules/counselling/repositories/counsellor-request.repository";
import { UserType, TokenResponse, SessionMeta } from "../auth.types";
import {
  LoginInput,
  CounsellorLoginInput,
  LoginBlogAuthorInput,
  PlatformLoginInput,
  RegisterCounsellorInput,
  RegisterAssociateAdminInput,
  RegisterEmployeeInput,
  RegisterBlogAuthorInput,
  RegisterStudentInput,
} from "../validators/auth.validator";

const OTP_TTL_MS = 5 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const otpStore = new Map<string, { otp: string; expiresAt: Date }>();
const resetTokenStore = new Map<string, { userId: string; expiresAt: Date }>();

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

    const blinkUser =
      await AuthRepository.findBlinkUserByEmail(normalizedEmail);
    if (!blinkUser) throw new UnauthorizedError("Invalid credentials");

    const isMatch = await CryptoUtils.compare(
      data.password,
      blinkUser.passwordHash,
    );
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    if (data.blink_role && blinkUser.blinkRole.slug !== data.blink_role) {
      const roleLabels: Record<string, string> = {
        associate_admin: "an associate admin",
        associate_employee: "an associate employee",
        campus_ambassador: "a campus ambassador",
      };
      const actual =
        roleLabels[blinkUser.blinkRole.slug] ?? blinkUser.blinkRole.slug;
      throw new ForbiddenError(
        `This account is registered as ${actual}. Please use the correct login.`,
      );
    }

    if (blinkUser.blinkRole.slug === BLINK_ROLES.ASSOCIATE_ADMIN) {
      if (
        !data.agency_reg_number ||
        blinkUser.agencyRegNumber !== data.agency_reg_number
      ) {
        throw new UnauthorizedError("Invalid agency registration number");
      }
    }

    if (blinkUser.blinkRole.slug === BLINK_ROLES.ASSOCIATE_EMPLOYEE) {
      const parentRegNumber = blinkUser.associateParent?.agencyRegNumber;
      if (
        !data.agency_reg_number ||
        !parentRegNumber ||
        parentRegNumber !== data.agency_reg_number
      ) {
        throw new UnauthorizedError("Invalid agency registration number");
      }
    }

    if (blinkUser.blinkRole.slug === BLINK_ROLES.CAMPUS_AMBASSADOR) {
      if (!data.campus_code || blinkUser.campusCode !== data.campus_code) {
        throw new UnauthorizedError("Invalid campus ambassador code");
      }
    }

    if (blinkUser.status !== ACCOUNT_STATUS.ACTIVE) {
      const isEmployee =
        blinkUser.blinkRole.slug === BLINK_ROLES.ASSOCIATE_EMPLOYEE;
      const contact = isEmployee ? "your agency admin" : "support";

      const statusMessages: Record<string, string> = {
        [ACCOUNT_STATUS.PENDING_APPROVAL]: isEmployee
          ? "Your account is pending approval by your agency admin."
          : "Your account is pending platform approval. You will be notified once approved.",
        [ACCOUNT_STATUS.REJECTED]: `Your account was not approved. Please contact ${contact}.`,
        [ACCOUNT_STATUS.SUSPENDED]: `Your account has been suspended. Please contact ${contact}.`,
        [ACCOUNT_STATUS.INACTIVE]: `Your account has been deactivated. Please contact ${contact}.`,
      };

      throw new ForbiddenError(
        statusMessages[blinkUser.status] ?? `Account is ${blinkUser.status}.`,
      );
    }

    const userType = getBlinkUserType(blinkUser.blinkRole.slug);
    const permissions = BLINK_ROLE_PERMISSIONS[blinkUser.blinkRole.slug] ?? [];
    const session = await AuthRepository.createSession({
      userId: blinkUser.id,
      userType,
      deviceInfo: data.fcm_token ? { fcmToken: data.fcm_token } : undefined,
    });

    if (data.fcm_token) {
      await AuthRepository.clearFcmTokensExcept(
        blinkUser.id,
        userType,
        session.sessionId,
      );
    }

    await AuthRepository.updateBlinkLastLogin(blinkUser.id);

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

  static async loginCounsellor(data: CounsellorLoginInput) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const counsellor =
      await AuthRepository.findCounsellorByEmail(normalizedEmail);
    if (!counsellor) {
      const request =
        await CounsellorRequestRepository.findByEmail(normalizedEmail);
      if (request?.status === "pending") {
        throw new ForbiddenError(
          "Your registration is pending admin approval. You will be able to log in once approved.",
        );
      }
      if (request?.status === "rejected") {
        throw new ForbiddenError(
          "Your registration was not approved. Please contact support.",
        );
      }
      throw new UnauthorizedError("Invalid credentials");
    }

    if (counsellor.counsellorType !== data.counsellor_type) {
      throw new ForbiddenError(
        `This account is registered as a ${counsellor.counsellorType} counsellor. Please use the correct login.`,
      );
    }

    const isMatch = await CryptoUtils.compare(
      data.password,
      counsellor.passwordHash,
    );
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    // counsellorCode is only assigned to some accounts (not generated at
    // registration) — only enforce the match once one has been set, so
    // existing counsellors without a code aren't locked out.
    if (
      counsellor.counsellorCode &&
      counsellor.counsellorCode !== data.counsellor_code
    ) {
      throw new UnauthorizedError("Invalid counsellor code");
    }

    if (counsellor.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new ForbiddenError(`Account is ${counsellor.status}`);
    }

    const session = await AuthRepository.createSession({
      userId: counsellor.id,
      userType: USER_TYPES.COUNSELLOR,
      deviceInfo: data.fcm_token ? { fcmToken: data.fcm_token } : undefined,
    });

    if (data.fcm_token) {
      await AuthRepository.clearFcmTokensExcept(
        counsellor.id,
        USER_TYPES.COUNSELLOR,
        session.sessionId,
      );
    }

    await AuthRepository.updateCounsellorLastLogin(counsellor.id);

    const accessToken = JwtUtils.generateAccessToken({
      userId: counsellor.id,
      userType: USER_TYPES.COUNSELLOR,
      permissions: [],
      sessionId: session.sessionId,
      counsellorType: counsellor.counsellorType as "academic" | "mindcare",
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
    const existing = await AuthRepository.findCounsellorByEmail(data.email);
    if (existing) throw new ConflictError("Email already exists");

    const passwordHash = await CryptoUtils.hash(data.password);

    const counsellor = await AuthRepository.createCounsellor({
      fullName: data.full_name,
      email: data.email,
      passwordHash,
      phoneNumber: data.phone_number,
      counsellorType: data.counsellor_type,
      status: ACCOUNT_STATUS.ACTIVE,
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
      counsellorType: counsellor.counsellorType as "academic" | "mindcare",
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

    const existingEmail =
      await AuthRepository.findBlinkUserByEmail(normalizedEmail);
    if (existingEmail) throw new ConflictError("Email already exists");

    const existingReg = await AuthRepository.findBlinkUserByRegNumber(
      data.agency_reg_number,
    );
    if (existingReg)
      throw new ConflictError("Agency registration number already exists");

    const role = await AuthRepository.findBlinkRoleBySlug(
      BLINK_ROLES.ASSOCIATE_ADMIN,
    );
    if (!role) throw new NotFoundError("Blink role");

    const passwordHash = await CryptoUtils.hash(data.password);

    const user = await AuthRepository.createBlinkUser({
      fullName: data.full_name,
      email: normalizedEmail,
      passwordHash,
      phoneNumber: data.phone_number,
      country: data.country,
      agencyName: data.agency_name,
      agencyRegNumber: data.agency_reg_number,
      blinkRoleId: role.id,
      status: ACCOUNT_STATUS.PENDING_APPROVAL,
      companyPan: data.companyPan,
      currentAccNo: data.currentAccNo,
      ifsc: data.ifsc,
      gstin: data.gstin,
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
        companyPan: user.companyPan,
        currentAccNo: user.currentAccNo,
        ifsc: user.ifsc,
        gstin: user.gstin,
      },
      tokens: { accessToken, refreshToken: session.refreshToken },
    };
  }

  static async registerEmployee(data: RegisterEmployeeInput) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingEmail =
      await AuthRepository.findBlinkUserByEmail(normalizedEmail);
    if (existingEmail) throw new ConflictError("Email already exists");

    const parentUser = await AuthRepository.findBlinkUserByRegNumberWithRole(
      data.agency_reg_number,
    );
    if (!parentUser) throw new NotFoundError("Agency registration number");
    if (parentUser.blinkRole.slug !== BLINK_ROLES.ASSOCIATE_ADMIN) {
      throw new ForbiddenError(
        "Target agency is not an associate admin account",
      );
    }

    const role = await AuthRepository.findBlinkRoleBySlug(
      BLINK_ROLES.ASSOCIATE_EMPLOYEE,
    );
    if (!role) throw new NotFoundError("Blink role");

    const passwordHash = await CryptoUtils.hash(data.password);

    const user = await AuthRepository.createBlinkUser({
      fullName: data.full_name,
      email: normalizedEmail,
      passwordHash,
      phoneNumber: data.phone_number,
      associateParentId: parentUser.id,
      blinkRoleId: role.id,
      status: ACCOUNT_STATUS.PENDING_APPROVAL,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        roleSlug: user.blinkRole.slug,
      },
      message:
        "Registration submitted. Your account is pending approval by your agency admin.",
    };
  }

  static async loginPlatformAdmin(
    data: PlatformLoginInput,
    sessionMeta?: SessionMeta,
  ) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const admin =
      await AuthRepository.findPlatformAdminByEmail(normalizedEmail);
    if (!admin) throw new UnauthorizedError("Invalid credentials");

    const isMatch = await CryptoUtils.compare(
      data.password,
      admin.passwordHash,
    );
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    if (!admin.platformRole) {
      throw new UnauthorizedError(
        "Your account has no assigned role. Please contact support.",
      );
    }

    if (admin.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new ForbiddenError(`Account is ${admin.status}`);
    }

    await AuthRepository.updatePlatformAdminLastLogin(admin.id);

    const session = await AuthRepository.createSession({
      userId: admin.id,
      userType: USER_TYPES.PLATFORM_ADMIN,
      ipAddress: sessionMeta?.ipAddress,
      deviceInfo: sessionMeta?.userAgent
        ? { userAgent: sessionMeta.userAgent }
        : undefined,
    });

    const rolePermissions = admin.platformRole.permissions.map(
      (p) => p.permissionCode,
    );
    const permissions = rolePermissions.includes("*") ? ["*"] : rolePermissions;

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
        permissions,
      },
      tokens: { accessToken, refreshToken: session.refreshToken },
    };
  }

  static async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token missing");
    }

    if (!JwtUtils.isRefreshTokenValid(refreshToken)) {
      await AuthRepository.invalidateSession(refreshToken);
      throw new UnauthorizedError("Invalid refresh token");
    }

    const session = await AuthRepository.findSession(refreshToken);
    if (!session)
      throw new UnauthorizedError("Invalid or expired refresh token");

    const userData = await this.getUserForRefresh(
      session.userId,
      session.userType as UserType,
    );
    if (!userData) throw new UnauthorizedError("User not found");

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
      counsellorType: (userData as { counsellorType?: "academic" | "mindcare" })
        .counsellorType,
    });

    return { accessToken, refreshToken: newSession.refreshToken };
  }

  static async registerBlogAuthor(data: RegisterBlogAuthorInput) {
    const existing = await AuthRepository.findBlogAuthorByEmail(data.email);
    if (existing) throw new ConflictError("Email already exists");

    const passwordHash = await CryptoUtils.hash(data.password);
    const author = await AuthRepository.createBlogAuthor({
      fullName: data.full_name,
      email: data.email,
      passwordHash,
      bio: data.bio ?? null,
    });

    const session = await AuthRepository.createSession({
      userId: author.id,
      userType: USER_TYPES.BLOG_AUTHOR,
    });

    const accessToken = JwtUtils.generateAccessToken({
      userId: author.id,
      userType: USER_TYPES.BLOG_AUTHOR,
      permissions: [],
      sessionId: session.sessionId,
    });

    return {
      user: {
        id: author.id,
        email: author.email,
        fullName: author.fullName,
        bio: author.bio,
      },
      tokens: { accessToken, refreshToken: session.refreshToken },
    };
  }

  static async loginBlogAuthor(data: LoginBlogAuthorInput) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const author = await AuthRepository.findBlogAuthorByEmail(normalizedEmail);
    if (!author) throw new UnauthorizedError("Invalid credentials");

    const isMatch = await CryptoUtils.compare(
      data.password,
      author.passwordHash,
    );
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    if (author.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new ForbiddenError(`Account is ${author.status}`);
    }

    const session = await AuthRepository.createSession({
      userId: author.id,
      userType: USER_TYPES.BLOG_AUTHOR,
    });

    await AuthRepository.updateBlogAuthorLastLogin(author.id);

    const accessToken = JwtUtils.generateAccessToken({
      userId: author.id,
      userType: USER_TYPES.BLOG_AUTHOR,
      permissions: [],
      sessionId: session.sessionId,
    });

    return {
      user: {
        id: author.id,
        email: author.email,
        fullName: author.fullName,
        bio: author.bio,
      },
      tokens: { accessToken, refreshToken: session.refreshToken },
    };
  }

  static async sendStudentOtp(
    phoneNumber: string,
    phoneCountryCode: string,
  ): Promise<{ devOtp?: string }> {
    const key = `${phoneCountryCode}${phoneNumber}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore.set(key, { otp, expiresAt: new Date(Date.now() + OTP_TTL_MS) });
    // TODO: deliver via SMS/WhatsApp provider using `key` and `otp`
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV OTP] ${key}: ${otp}`);
      return { devOtp: otp };
    }
    return {};
  }

  static async verifyStudentOtp(
    phoneNumber: string,
    phoneCountryCode: string,
    otp: string,
    fcmToken?: string,
  ) {
    const key = `${phoneCountryCode}${phoneNumber}`;

    const isDevBypass = process.env.NODE_ENV !== "production" && otp === "0000";

    if (!isDevBypass) {
      const entry = otpStore.get(key);
      if (!entry || entry.otp !== otp || entry.expiresAt < new Date()) {
        throw new UnauthorizedError("Invalid or expired OTP");
      }
      otpStore.delete(key);
    }

    const student = await AuthRepository.findStudentByPhone(
      phoneNumber,
      phoneCountryCode,
    );

    if (student) {
      if (student.status !== ACCOUNT_STATUS.ACTIVE) {
        throw new ForbiddenError(`Account is ${student.status}`);
      }
      await AuthRepository.updateStudentLastLogin(student.id);
      const session = await AuthRepository.createSession({
        userId: student.id,
        userType: USER_TYPES.STUDENT,
        deviceInfo: fcmToken ? { fcmToken } : undefined,
      });
      if (fcmToken) {
        await AuthRepository.clearFcmTokensExcept(
          student.id,
          USER_TYPES.STUDENT,
          session.sessionId,
        );
      }
      const accessToken = JwtUtils.generateAccessToken({
        userId: student.id,
        userType: USER_TYPES.STUDENT,
        permissions: [],
        sessionId: session.sessionId,
      });
      return {
        isNewUser: false as const,
        user: {
          id: student.id,
          fullName: student.fullName,
          email: student.email,
          avatarUrl: student.avatarUrl,
        },
        tokens: { accessToken, refreshToken: session.refreshToken },
      };
    }

    const registrationToken = JwtUtils.generateRegistrationToken({
      phoneNumber,
      phoneCountryCode,
    });
    return { isNewUser: true as const, registrationToken };
  }

  static async registerStudent(data: RegisterStudentInput) {
    const tokenPayload = JwtUtils.verifyRegistrationToken(
      data.registration_token,
    );
    if (
      !tokenPayload ||
      tokenPayload.phoneNumber !== data.phone_number ||
      tokenPayload.phoneCountryCode !== data.phone_country_code
    ) {
      throw new UnauthorizedError("Invalid or expired registration token");
    }

    const existing = await AuthRepository.findStudentByPhone(
      data.phone_number,
      data.phone_country_code,
    );
    if (existing) throw new ConflictError("Phone number already registered");

    const student = await AuthRepository.createStudent({
      fullName: data.full_name,
      email: data.email ?? null,
      phoneNumber: data.phone_number,
      phoneCountryCode: data.phone_country_code,
      isPhoneVerified: true,
    });

    const session = await AuthRepository.createSession({
      userId: student.id,
      userType: USER_TYPES.STUDENT,
      deviceInfo: data.fcm_token ? { fcmToken: data.fcm_token } : undefined,
    });
    if (data.fcm_token) {
      await AuthRepository.clearFcmTokensExcept(
        student.id,
        USER_TYPES.STUDENT,
        session.sessionId,
      );
    }
    const accessToken = JwtUtils.generateAccessToken({
      userId: student.id,
      userType: USER_TYPES.STUDENT,
      permissions: [],
      sessionId: session.sessionId,
    });

    return {
      user: {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        avatarUrl: student.avatarUrl,
      },
      tokens: { accessToken, refreshToken: session.refreshToken },
    };
  }

  static async loginWithFirebaseGoogle(idToken: string, fcmToken?: string) {
    if (!firebaseAuth) {
      throw new UnauthorizedError("Google authentication is not configured");
    }

    let decoded: Awaited<ReturnType<typeof firebaseAuth.verifyIdToken>>;
    try {
      decoded = await firebaseAuth.verifyIdToken(idToken);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/id-token-expired") {
        throw new UnauthorizedError("Google token has expired");
      }
      throw new UnauthorizedError("Invalid Google token");
    }

    if (!decoded.email_verified) {
      throw new ForbiddenError("Google account email is not verified");
    }

    const student = await AuthRepository.upsertStudentFromGoogle({
      googleId: decoded.uid,
      email: decoded.email!,
      fullName: decoded.name ?? decoded.email!,
      avatarUrl: decoded.picture ?? null,
    });

    if (student.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new ForbiddenError(`Account is ${student.status}`);
    }

    const session = await AuthRepository.createSession({
      userId: student.id,
      userType: USER_TYPES.STUDENT,
      deviceInfo: fcmToken ? { fcmToken } : undefined,
    });

    if (fcmToken) {
      await AuthRepository.clearFcmTokensExcept(
        student.id,
        USER_TYPES.STUDENT,
        session.sessionId,
      );
    }

    const accessToken = JwtUtils.generateAccessToken({
      userId: student.id,
      userType: USER_TYPES.STUDENT,
      permissions: [],
      sessionId: session.sessionId,
    });

    return {
      user: {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        avatarUrl: student.avatarUrl,
      },
      tokens: { accessToken, refreshToken: session.refreshToken },
    };
  }

  static async logout(refreshToken: string): Promise<void> {
    const sessionId = await AuthRepository.invalidateSession(refreshToken);
    if (sessionId) await markSessionRevoked(sessionId);
  }

  /** Deduped to one entry per distinct (userAgent, ip) fingerprint —
   * refresh-token rotation creates a new UserSession row on every refresh,
   * so without this the same real-world device/browser would appear many
   * times. Assumes `sessions` is already ordered most-recently-active
   * first, so the first row seen per fingerprint wins. */
  private static dedupeSessionsByDevice<
    T extends {
      id: string;
      deviceInfo: unknown;
      ipAddress: string | null;
    },
  >(sessions: T[]): T[] {
    const seen = new Set<string>();
    return sessions.filter((s) => {
      const deviceInfo = (s.deviceInfo ?? {}) as { userAgent?: string };
      const fingerprint = `${deviceInfo.userAgent ?? "unknown"}::${s.ipAddress ?? "unknown"}`;
      if (seen.has(fingerprint)) return false;
      seen.add(fingerprint);
      return true;
    });
  }

  private static formatSession(
    s: {
      id: string;
      deviceInfo: unknown;
      ipAddress: string | null;
      lastActiveAt: Date;
      createdAt: Date;
      expiresAt: Date;
    },
    currentSessionId?: string,
  ) {
    const deviceInfo = (s.deviceInfo ?? {}) as { userAgent?: string };
    return {
      id: s.id,
      userAgent: deviceInfo.userAgent ?? null,
      ipAddress: s.ipAddress,
      lastActiveAt: s.lastActiveAt,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      isCurrent: s.id === currentSessionId,
    };
  }

  /** Active sessions for one user, most-recently-active first, deduped by
   * device fingerprint. */
  static async listSessionsForUser(
    userId: string,
    userType: UserType,
    currentSessionId?: string,
  ) {
    const sessions = await AuthRepository.listActiveSessionsForUser(
      userId,
      userType,
    );
    const deduped = this.dedupeSessionsByDevice(sessions);
    return deduped.map((s) => this.formatSession(s, currentSessionId));
  }

  /** Active sessions across many users of the same type, most-recently-active
   * first within each user, deduped by device fingerprint per user (not
   * globally — two different staff members legitimately sharing a device
   * fingerprint, e.g. the same shared front-desk PC, must both still show
   * up). Returns a Map keyed by userId so callers can attach owner info. */
  static async listSessionsForUsers(
    userIds: string[],
    userType: UserType,
  ): Promise<Map<string, ReturnType<typeof AuthService.formatSession>[]>> {
    const sessions = await AuthRepository.listActiveSessionsForUsers(
      userIds,
      userType,
    );

    const byUser = new Map<string, typeof sessions>();
    for (const s of sessions) {
      const bucket = byUser.get(s.userId);
      if (bucket) bucket.push(s);
      else byUser.set(s.userId, [s]);
    }

    const result = new Map<
      string,
      ReturnType<typeof AuthService.formatSession>[]
    >();
    for (const [userId, userSessions] of byUser) {
      const deduped = this.dedupeSessionsByDevice(userSessions);
      result.set(
        userId,
        deduped.map((s) => this.formatSession(s)),
      );
    }
    return result;
  }

  /** Force-signs-out a single session by id, scoped to the expected owner
   * so a caller can't revoke an arbitrary session by guessing its id.
   * Returns false if the session doesn't exist, is already inactive, or
   * doesn't belong to (userId, userType). */
  static async forceLogoutSession(
    sessionId: string,
    userId: string,
    userType: UserType,
  ): Promise<boolean> {
    const session = await AuthRepository.findActiveSessionById(sessionId);
    if (
      !session ||
      session.userId !== userId ||
      session.userType !== userType
    ) {
      return false;
    }

    await AuthRepository.deactivateSessionById(sessionId);
    await markSessionRevoked(sessionId);
    return true;
  }

  /** Force-signs-out every active session for one user (all devices). */
  static async forceLogoutAllSessions(
    userId: string,
    userType: UserType,
  ): Promise<number> {
    const sessionIds = await AuthRepository.invalidateAllUserSessions(
      userId,
      userType,
    );
    await Promise.all(sessionIds.map((id) => markSessionRevoked(id)));
    return sessionIds.length;
  }

  private static async getUserForRefresh(userId: string, userType: UserType) {
    switch (userType) {
      case USER_TYPES.BLINK_ASSOCIATE:
      case USER_TYPES.BLINK_EMPLOYEE:
      case USER_TYPES.BLINK_AMBASSADOR: {
        const blinkUser = await AuthRepository.findBlinkUserById(userId);
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
        const staff = await AuthRepository.findStaffMemberById(userId);
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
        const admin = await AuthRepository.findPlatformAdminById(userId);
        const rolePermissions =
          admin?.platformRole?.permissions.map((p) => p.permissionCode) || [];
        const permissions = rolePermissions.includes("*")
          ? ["*"]
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
        const student = await AuthRepository.findStudentById(userId);
        return student
          ? { roleId: undefined, collegeId: undefined, permissions: [] }
          : null;
      }

      case USER_TYPES.COUNSELLOR: {
        const counsellor = await AuthRepository.findCounsellorById(userId);
        return counsellor
          ? {
              roleId: undefined,
              collegeId: undefined,
              permissions: [],
              counsellorType: counsellor.counsellorType as
                | "academic"
                | "mindcare",
            }
          : null;
      }

      case USER_TYPES.BLOG_AUTHOR: {
        const author = await AuthRepository.findBlogAuthorById(userId);
        return author
          ? { roleId: undefined, collegeId: undefined, permissions: [] }
          : null;
      }

      default:
        return null;
    }
  }

  // ── Blink forgot-password ────────────────────────────────────────────────

  static async blinkForgotPassword(
    email: string,
  ): Promise<{ devOtp?: string }> {
    const user = await AuthRepository.findBlinkUserByEmail(email);
    if (!user) throw new NotFoundError("Account with this email");
    if (!user.phoneNumber)
      throw new ValidationError("No phone number on file for this account");

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const key = `blink-reset:${email}`;
    otpStore.set(key, { otp, expiresAt: new Date(Date.now() + OTP_TTL_MS) });

    // TODO: deliver via SMS/WhatsApp to user.phoneCountryCode + user.phoneNumber
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV RESET OTP] ${email}: ${otp}`);
      return { devOtp: otp };
    }
    return {};
  }

  static async blinkVerifyResetOtp(
    email: string,
    otp: string,
  ): Promise<{ resetToken: string }> {
    const key = `blink-reset:${email}`;
    const stored = otpStore.get(key);

    if (!stored || stored.otp !== otp || stored.expiresAt < new Date()) {
      throw new ValidationError("Invalid or expired OTP");
    }

    const user = await AuthRepository.findBlinkUserByEmail(email);
    if (!user) throw new NotFoundError("User");

    otpStore.delete(key);

    const resetToken = crypto.randomUUID();
    resetTokenStore.set(resetToken, {
      userId: user.id,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    return { resetToken };
  }

  static async blinkResetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<void> {
    const entry = resetTokenStore.get(resetToken);

    if (!entry || entry.expiresAt < new Date()) {
      throw new ValidationError("Invalid or expired reset token");
    }

    const passwordHash = await CryptoUtils.hash(newPassword);
    await AuthRepository.updateBlinkUserById(entry.userId, {
      passwordHash,
      passwordChangedAt: new Date(),
    });

    resetTokenStore.delete(resetToken);
  }
}
