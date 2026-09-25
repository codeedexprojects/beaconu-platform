import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@beaconu/db";
import { ACCOUNT_STATUS, USER_TYPES } from "@/shared/constants";
import { BadRequestError } from "@/shared/errors";
import { enqueueEmail, enqueueEmailSafe } from "@/shared/lib/email";
import { logger } from "@/shared/lib/logger";
import { getRedisClient } from "@/shared/lib/redis";
import { CryptoUtils } from "@/shared/utils";
import { buildCollegeAdminUrl } from "@/shared/utils/college-url.utils";
import { CollegeProvisioningRepository } from "@/modules/colleges/repositories/college-provisioning.repository";
import { AuthService } from "./auth.service";

const TOKEN_KEY_PREFIX = "pwreset:staff:";
const COOLDOWN_KEY_PREFIX = "pwreset:staff:cooldown:";
const RESET_TOKEN_TTL_SECONDS = 60 * 60;
const INVITE_TOKEN_TTL_SECONDS = 48 * 60 * 60;
// One reset email per account per window — stops mail-bombing an inbox.
const REQUEST_COOLDOWN_SECONDS = 60;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export class StaffPasswordResetService {
  /**
   * Issue a single-use token. Only its SHA-256 hash is stored, so a Redis
   * dump can't be replayed as a valid link.
   */
  private static async issueToken(
    staffId: string,
    ttlSeconds: number,
  ): Promise<string> {
    const token = randomBytes(32).toString("base64url");
    await getRedisClient().set(
      `${TOKEN_KEY_PREFIX}${hashToken(token)}`,
      staffId,
      "EX",
      ttlSeconds,
    );
    return token;
  }

  /**
   * Handle a "forgot password" request. Always resolves without revealing
   * whether the account exists — callers must return the same response
   * either way.
   */
  static async requestReset(email: string, collegeSlug: string): Promise<void> {
    const staff = await CollegeProvisioningRepository.findStaffByEmail(
      email,
      collegeSlug,
    );
    if (!staff || staff.status !== ACCOUNT_STATUS.ACTIVE) {
      logger.info({ collegeSlug }, "Password reset requested for no account");
      return;
    }

    const acquired = await getRedisClient().set(
      `${COOLDOWN_KEY_PREFIX}${staff.id}`,
      "1",
      "EX",
      REQUEST_COOLDOWN_SECONDS,
      "NX",
    );
    if (!acquired) return;

    const token = await StaffPasswordResetService.issueToken(
      staff.id,
      RESET_TOKEN_TTL_SECONDS,
    );
    await enqueueEmailSafe("staff-password-reset", staff.email, {
      fullName: staff.fullName,
      collegeName: staff.college.name,
      resetUrl: buildCollegeAdminUrl(staff.college.slug, "/reset-password", {
        token,
      }),
      expiresInMinutes: RESET_TOKEN_TTL_SECONDS / 60,
    });
  }

  /** Email a newly invited staff member a link to choose their password. */
  static async sendInvite(staff: {
    id: string;
    email: string;
    fullName: string;
    college: { name: string; slug: string };
  }): Promise<void> {
    const token = await StaffPasswordResetService.issueToken(
      staff.id,
      INVITE_TOKEN_TTL_SECONDS,
    );
    await enqueueEmail("staff-invite", staff.email, {
      fullName: staff.fullName,
      collegeName: staff.college.name,
      loginUrl: buildCollegeAdminUrl(staff.college.slug, "/login"),
      setPasswordUrl: buildCollegeAdminUrl(
        staff.college.slug,
        "/reset-password",
        {
          token,
        },
      ),
      expiresInHours: INVITE_TOKEN_TTL_SECONDS / 3600,
    });
  }

  /** Consume a token and set a new password, signing out all sessions. */
  static async resetPassword(token: string, password: string): Promise<void> {
    // GETDEL makes the token single-use even under concurrent submissions.
    const staffId = await getRedisClient().getdel(
      `${TOKEN_KEY_PREFIX}${hashToken(token)}`,
    );
    if (!staffId) {
      throw new BadRequestError("This reset link is invalid or has expired");
    }

    const staff = await prisma.staffMember.findUnique({
      where: { id: staffId },
      select: { id: true, status: true },
    });
    if (!staff || staff.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new BadRequestError("This reset link is invalid or has expired");
    }

    const passwordHash = await CryptoUtils.hash(password);
    await prisma.staffMember.update({
      where: { id: staff.id },
      data: { passwordHash },
    });

    await AuthService.forceLogoutAllSessions(staff.id, USER_TYPES.STAFF);
    logger.info({ staffId: staff.id }, "Staff password reset completed");
  }
}
