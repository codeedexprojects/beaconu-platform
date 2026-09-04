import { prisma } from "@beaconu/db";
import type { Prisma } from "@beaconu/db";
import { JwtUtils } from "../auth.jwt";
import { SessionData } from "../auth.types";
import { SESSION_EXPIRY_DAYS } from "@/shared/constants";
import { UnauthorizedError } from "@/shared/errors";

interface AuthBlinkUserData {
  fullName: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string | null;
  country?: string | null;
  agencyName?: string | null;
  agencyRegNumber?: string | null;
  companyPan?: string | null;
  currentAccNo?: string | null;
  ifsc?: string | null;
  gstin?: string | null;
  associateParentId?: string | null;
  blinkRoleId: string;
  status: string;
  profileMetadata?: Prisma.InputJsonValue;
}

interface AuthCounsellorData {
  fullName: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string | null;
  counsellorType: "academic" | "mindcare";
  knownLanguages?: string | null;
  profileMetadata?: Prisma.InputJsonValue;
  status: string;
}

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

  /** Returns the id of the session that was invalidated, or null if none
   * matched (already inactive / unknown token) — callers use the id to also
   * mark the session revoked in Redis for immediate effect (see
   * shared/lib/session-revocation.ts). */
  static async invalidateSession(refreshToken: string): Promise<string | null> {
    const session = await prisma.userSession.findUnique({
      where: { refreshToken },
      select: { id: true, isActive: true },
    });
    if (!session || !session.isActive) return null;

    await prisma.userSession.update({
      where: { id: session.id },
      data: { isActive: false, deviceInfo: {} },
    });
    return session.id;
  }

  /** Returns the ids of all sessions that were invalidated — callers use
   * these to also mark each session revoked in Redis for immediate effect. */
  static async invalidateAllUserSessions(
    userId: string,
    userType: string,
  ): Promise<string[]> {
    const sessions = await prisma.userSession.findMany({
      where: { userId, userType, isActive: true },
      select: { id: true },
    });
    if (sessions.length === 0) return [];

    await prisma.userSession.updateMany({
      where: { userId, userType, isActive: true },
      data: { isActive: false, deviceInfo: {} },
    });
    return sessions.map((s) => s.id);
  }

  static async findActiveSessionById(sessionId: string) {
    return prisma.userSession.findFirst({
      where: { id: sessionId, isActive: true },
    });
  }

  static async deactivateSessionById(sessionId: string) {
    await prisma.userSession.update({
      where: { id: sessionId },
      data: { isActive: false, deviceInfo: {} },
    });
  }

  static async listActiveSessionsForUsers(userIds: string[], userType: string) {
    if (userIds.length === 0) return [];
    return prisma.userSession.findMany({
      where: { userId: { in: userIds }, userType, isActive: true },
      orderBy: { lastActiveAt: "desc" },
      select: {
        id: true,
        userId: true,
        deviceInfo: true,
        ipAddress: true,
        lastActiveAt: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  }

  static async listActiveSessionsForUser(userId: string, userType: string) {
    return prisma.userSession.findMany({
      where: { userId, userType, isActive: true },
      orderBy: { lastActiveAt: "desc" },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        lastActiveAt: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  }

  static async clearFcmTokensExcept(
    userId: string,
    userType: string,
    currentSessionId: string,
  ) {
    await prisma.userSession.updateMany({
      where: {
        userId,
        userType,
        isActive: true,
        id: { not: currentSessionId },
      },
      data: { deviceInfo: {} },
    });
  }

  static async findBlinkUserByEmail(email: string) {
    return prisma.blinkUser.findUnique({
      where: { email },
      include: {
        blinkRole: true,
        associateParent: { select: { agencyRegNumber: true } },
      },
    });
  }

  static async findBlinkUserById(id: string) {
    return prisma.blinkUser.findUnique({
      where: { id },
      include: { blinkRole: true },
    });
  }

  static async updateBlinkUserById(
    id: string,
    data: { passwordHash?: string; passwordChangedAt?: Date },
  ) {
    return prisma.blinkUser.update({ where: { id }, data });
  }

  static async findBlinkUserByRegNumber(regNumber: string) {
    return prisma.blinkUser.findUnique({
      where: { agencyRegNumber: regNumber },
    });
  }

  static async findBlinkUserByRegNumberWithRole(regNumber: string) {
    return prisma.blinkUser.findUnique({
      where: { agencyRegNumber: regNumber },
      include: { blinkRole: true },
    });
  }

  static async updateBlinkLastLogin(id: string): Promise<void> {
    await prisma.blinkUser.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  static async findBlinkRoleBySlug(slug: string) {
    return prisma.blinkRole.findUnique({ where: { slug } });
  }

  static async createBlinkUser(data: AuthBlinkUserData) {
    return prisma.blinkUser.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash,
        phoneNumber: data.phoneNumber,
        country: data.country,
        agencyName: data.agencyName,
        agencyRegNumber: data.agencyRegNumber,
        companyPan: data.companyPan,
        currentAccNo: data.currentAccNo,
        ifsc: data.ifsc,
        gstin: data.gstin,
        associateParentId: data.associateParentId,
        blinkRoleId: data.blinkRoleId,
        status: data.status,
        profileMetadata: data.profileMetadata ?? {},
      },
      include: { blinkRole: true },
    });
  }

  static async findCounsellorByEmail(email: string) {
    return prisma.counsellor.findUnique({ where: { email } });
  }

  static async findCounsellorCodesByEmails(
    emails: string[],
  ): Promise<Map<string, string>> {
    if (emails.length === 0) return new Map();
    const counsellors = await prisma.counsellor.findMany({
      where: { email: { in: emails } },
      select: { email: true, counsellorCode: true },
    });
    return new Map(
      counsellors
        .filter((c) => c.counsellorCode !== null)
        .map((c) => [c.email, c.counsellorCode!]),
    );
  }

  static async findCounsellorById(id: string) {
    return prisma.counsellor.findUnique({ where: { id } });
  }

  static async updateCounsellorLastLogin(id: string): Promise<void> {
    await prisma.counsellor.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  static async createCounsellor(data: AuthCounsellorData) {
    return prisma.counsellor.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash,
        phoneNumber: data.phoneNumber,
        counsellorType: data.counsellorType,
        knownLanguages: data.knownLanguages,
        profileMetadata: data.profileMetadata ?? {},
        status: data.status,
      },
    });
  }

  static async findPlatformAdminByEmail(email: string) {
    return prisma.platformAdmin.findUnique({
      where: { email },
      include: { platformRole: { include: { permissions: true } } },
    });
  }

  static async findPlatformAdminById(id: string) {
    return prisma.platformAdmin.findUnique({
      where: { id },
      include: { platformRole: { include: { permissions: true } } },
    });
  }

  static async updatePlatformAdminLastLogin(id: string): Promise<void> {
    await prisma.platformAdmin.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  static async findStaffMemberById(id: string) {
    return prisma.staffMember.findUnique({
      where: { id },
      include: { collegeRole: { include: { permissions: true } } },
    });
  }

  static async findStudentById(id: string) {
    return prisma.student.findUnique({ where: { id } });
  }

  static async findStudentByPhone(
    phoneNumber: string,
    phoneCountryCode: string,
  ) {
    return prisma.student.findFirst({
      where: { phoneNumber, phoneCountryCode },
    });
  }

  static async createStudent(data: {
    fullName: string;
    email?: string | null;
    phoneNumber: string;
    phoneCountryCode: string;
    isPhoneVerified: boolean;
  }) {
    return prisma.student.create({
      data: {
        fullName: data.fullName,
        email: data.email ?? null,
        phoneNumber: data.phoneNumber,
        phoneCountryCode: data.phoneCountryCode,
        isPhoneVerified: data.isPhoneVerified,
        status: "active",
      },
    });
  }

  static async updateStudentLastLogin(id: string): Promise<void> {
    await prisma.student.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  static async findStudentByEmail(email: string) {
    return prisma.student.findUnique({ where: { email } });
  }

  static async findStudentByGoogleId(googleId: string) {
    return prisma.student.findUnique({ where: { googleId } });
  }

  static async upsertStudentFromGoogle(data: {
    googleId: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
  }) {
    const updateFields = {
      fullName: data.fullName,
      avatarUrl: data.avatarUrl ?? null,
      isEmailVerified: true,
      lastLoginAt: new Date(),
    };

    const byGoogle = await prisma.student.findUnique({
      where: { googleId: data.googleId },
    });
    if (byGoogle) {
      return prisma.student.update({
        where: { id: byGoogle.id },
        data: updateFields,
      });
    }

    const byEmail = await prisma.student.findUnique({
      where: { email: data.email },
    });
    if (byEmail) {
      return prisma.student.update({
        where: { id: byEmail.id },
        data: { googleId: data.googleId, ...updateFields },
      });
    }

    return prisma.student.create({
      data: {
        googleId: data.googleId,
        email: data.email,
        fullName: data.fullName,
        avatarUrl: data.avatarUrl ?? null,
        isEmailVerified: true,
        source: "google",
        status: "active",
      },
    });
  }

  static async findBlogAuthorByEmail(email: string) {
    return prisma.blogAuthor.findUnique({ where: { email } });
  }

  static async findBlogAuthorById(id: string) {
    return prisma.blogAuthor.findUnique({ where: { id } });
  }

  static async updateBlogAuthorLastLogin(id: string): Promise<void> {
    await prisma.blogAuthor.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  static async createBlogAuthor(data: {
    fullName: string;
    email: string;
    passwordHash: string;
    bio?: string | null;
  }) {
    return prisma.blogAuthor.create({ data });
  }
}
