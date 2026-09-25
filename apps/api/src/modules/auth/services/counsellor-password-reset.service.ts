import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { ACCOUNT_STATUS, USER_TYPES } from "@/shared/constants";
import { BadRequestError } from "@/shared/errors";
import { enqueueEmailSafe } from "@/shared/lib/email";
import { logger } from "@/shared/lib/logger";
import { getRedisClient } from "@/shared/lib/redis";
import { CryptoUtils } from "@/shared/utils";
import { AuthRepository } from "../repositories/auth.repository";
import { AuthService } from "./auth.service";

const OTP_KEY_PREFIX = "pwreset:counsellor:otp:";
const ATTEMPTS_KEY_PREFIX = "pwreset:counsellor:attempts:";
const COOLDOWN_KEY_PREFIX = "pwreset:counsellor:cooldown:";
const OTP_TTL_SECONDS = 10 * 60;
const MAX_VERIFY_ATTEMPTS = 5;
// One code per account per window — stops mail-bombing an inbox.
const REQUEST_COOLDOWN_SECONDS = 60;
const INVALID_OTP_MESSAGE = "Invalid or expired code";

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export class CounsellorPasswordResetService {
  /**
   * Email a 6-digit code. Always resolves without revealing whether the
   * account exists — callers must return the same response either way.
   * Only the code's SHA-256 hash is stored.
   */
  static async requestReset(email: string): Promise<void> {
    const counsellor = await AuthRepository.findCounsellorByEmail(email);
    if (!counsellor || counsellor.status !== ACCOUNT_STATUS.ACTIVE) {
      logger.info("Counsellor password reset requested for no account");
      return;
    }

    const redis = getRedisClient();
    const acquired = await redis.set(
      `${COOLDOWN_KEY_PREFIX}${counsellor.id}`,
      "1",
      "EX",
      REQUEST_COOLDOWN_SECONDS,
      "NX",
    );
    if (!acquired) return;

    const otp = randomInt(0, 1_000_000).toString().padStart(6, "0");
    await redis.set(
      `${OTP_KEY_PREFIX}${counsellor.id}`,
      hashOtp(otp),
      "EX",
      OTP_TTL_SECONDS,
    );
    // A fresh code resets the wrong-guess budget.
    await redis.del(`${ATTEMPTS_KEY_PREFIX}${counsellor.id}`);

    await enqueueEmailSafe("counsellor-password-reset-otp", counsellor.email, {
      fullName: counsellor.fullName,
      otp,
      expiresInMinutes: OTP_TTL_SECONDS / 60,
    });
  }

  /** Verify the code and set a new password, signing out all sessions. */
  static async resetPassword(
    email: string,
    otp: string,
    password: string,
  ): Promise<void> {
    const counsellor = await AuthRepository.findCounsellorByEmail(email);
    if (!counsellor || counsellor.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new BadRequestError(INVALID_OTP_MESSAGE);
    }

    const redis = getRedisClient();
    const otpKey = `${OTP_KEY_PREFIX}${counsellor.id}`;
    const attemptsKey = `${ATTEMPTS_KEY_PREFIX}${counsellor.id}`;

    const attempts = await redis.incr(attemptsKey);
    if (attempts === 1) await redis.expire(attemptsKey, OTP_TTL_SECONDS);
    if (attempts > MAX_VERIFY_ATTEMPTS) {
      await redis.del(otpKey);
      throw new BadRequestError(
        "Too many attempts. Please request a new code.",
      );
    }

    const storedHash = await redis.get(otpKey);
    const expected = Buffer.from(storedHash ?? "");
    const actual = Buffer.from(hashOtp(otp));
    if (
      !storedHash ||
      expected.length !== actual.length ||
      !timingSafeEqual(expected, actual)
    ) {
      throw new BadRequestError(INVALID_OTP_MESSAGE);
    }

    // DEL returns 0 if a concurrent request already consumed the code.
    if ((await redis.del(otpKey)) === 0) {
      throw new BadRequestError(INVALID_OTP_MESSAGE);
    }
    await redis.del(attemptsKey);

    const passwordHash = await CryptoUtils.hash(password);
    await AuthRepository.updateCounsellorPassword(counsellor.id, passwordHash);

    await AuthService.forceLogoutAllSessions(
      counsellor.id,
      USER_TYPES.COUNSELLOR,
    );
    logger.info(
      { counsellorId: counsellor.id },
      "Counsellor password reset completed",
    );
  }
}
