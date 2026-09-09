import { Prisma } from "@beaconu/db";
import { logger } from "@/shared/lib/logger";
import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { generateShortCode } from "@/shared/utils";
import { buildAppReferralUrl } from "@/shared/utils/college-url.utils";
import { PlatformConfigService } from "@/modules/platform-config/services/platform-config.service";
import { StudentReferralRepository } from "../repositories/student-referral.repository";

/** 2dp, half-up. Decimal(10,2) x Decimal(5,2) overflows the amount column. */
function roundToPaise(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

// Separate from Blink referrals: different tables, payout rules and audience.
export class StudentReferralService {
  /** Created on first request. Enrolled students only. */
  static async getOrCreateCode(studentId: string) {
    const existing =
      await StudentReferralRepository.findCodeByStudent(studentId);
    if (existing) {
      return {
        code: existing.code,
        shareUrl: existing.shareUrl,
        totalSignups: existing.totalSignups,
      };
    }

    const isEnrolled =
      await StudentReferralRepository.hasActiveEnrollment(studentId);
    if (!isEnrolled) {
      throw new ForbiddenError(
        "Referral codes are available once you're enrolled in a college",
      );
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateShortCode();
      if (await StudentReferralRepository.findCodeByValue(code)) continue;

      try {
        const created = await StudentReferralRepository.createCode({
          studentId,
          code,
          shareUrl: buildAppReferralUrl(code),
        });
        return {
          code: created.code,
          shareUrl: created.shareUrl,
          totalSignups: created.totalSignups,
        };
      } catch (error) {
        // Unique-constraint race on `code` — retry with a fresh one.
        if (attempt === 4) throw error;
      }
    }

    throw new ConflictError("Could not generate a unique referral code, retry");
  }

  static async listMyReferrals(studentId: string) {
    const referrals =
      await StudentReferralRepository.listReferralsByReferrer(studentId);

    return referrals.map((r) => ({
      id: r.id,
      status: r.status,
      invitedAt: r.createdAt.toISOString(),
      paidAt: r.paidAt?.toISOString() ?? null,
      earnedAmount: r.payoutAmount != null ? Number(r.payoutAmount) : null,
      student: {
        id: r.referredStudent.id,
        fullName: r.referredStudent.fullName,
        avatarUrl: r.referredStudent.avatarUrl,
      },
    }));
  }

  /** Public. Returns nothing identifying about the referrer. */
  static async resolveCode(code: string) {
    const found = await StudentReferralRepository.findActiveCodeByValue(code);
    if (!found) throw new NotFoundError("Referral code");

    await StudentReferralRepository.incrementClicks(found.id);
    return { valid: true as const, code };
  }

  /** The Play Install Referrer arrives as a query string; a deep link or
   * manual entry gives the code directly. Null when there is no referral. */
  static extractCode(input: {
    code?: string;
    referrer?: string;
  }): string | null {
    if (input.code) return input.code;
    if (!input.referrer) return null;

    let raw = input.referrer;
    try {
      raw = decodeURIComponent(input.referrer);
    } catch {
      // Malformed percent-encoding — parse the raw string.
    }

    const params = new URLSearchParams(raw);
    return params.get("ref") ?? params.get("referral_code") ?? null;
  }

  /** Never 404s: an organic install has no referrer and gets a clean negative. */
  static async resolveFromInstall(input: { code?: string; referrer?: string }) {
    const code = StudentReferralService.extractCode(input);
    if (!code) return { valid: false as const, code: null };

    const found = await StudentReferralRepository.findActiveCodeByValue(code);
    if (!found) return { valid: false as const, code: null };

    await StudentReferralRepository.incrementClicks(found.id);
    return { valid: true as const, code };
  }

  /** Called from the auth service on signup. Never throws: a bad code must
   * not block account creation. */
  static async attachReferralOnSignup(
    referredStudentId: string,
    code: string,
  ): Promise<void> {
    try {
      const referralCode =
        await StudentReferralRepository.findActiveCodeByValue(code);
      if (!referralCode) return;

      if (referralCode.studentId === referredStudentId) {
        logger.info(
          { referredStudentId, code },
          "Self-referral attempt ignored at signup",
        );
        return;
      }

      // Attributed once, ever — account linking must not re-attribute.
      const existing =
        await StudentReferralRepository.findReferralForReferredStudent(
          referredStudentId,
        );
      if (existing) return;

      await StudentReferralRepository.createReferral({
        referralCodeId: referralCode.id,
        referrerStudentId: referralCode.studentId,
        referredStudentId,
      });

      logger.info(
        {
          module: "engagement",
          action: "STUDENT_REFERRAL_ATTACHED",
          referredStudentId,
          referrerStudentId: referralCode.studentId,
        },
        "Student referral attached at signup",
      );
    } catch (error) {
      logger.warn(
        { error, referredStudentId, code },
        "Failed to attach student referral at signup — continuing without it",
      );
    }
  }

  /** Runs inside the caller's enrollment transaction. Payout is a configured
   * percentage of the course's referral_commission_amount. Never throws. */
  static async creditReferralForEnrollment(
    tx: Prisma.TransactionClient,
    referredStudentId: string,
    referralCommissionAmount: Prisma.Decimal | number | null,
  ): Promise<void> {
    try {
      const referral =
        await StudentReferralRepository.findUnpaidReferralForStudent(
          tx,
          referredStudentId,
        );
      if (!referral) return;

      const statusHistory = Array.isArray(referral.statusHistory)
        ? referral.statusHistory
        : [];
      const now = new Date().toISOString();

      const base = Number(referralCommissionAmount ?? 0);
      const config = await PlatformConfigService.getConfig();
      const percentage = Number(config.studentReferralPercentage ?? 0);
      const payout = roundToPaise((base * percentage) / 100);

      // No course amount or percentage still 0 — record it, pay nothing.
      if (base <= 0 || percentage <= 0 || payout <= 0) {
        await StudentReferralRepository.markEnrolledUnpaid(tx, referral.id, [
          ...statusHistory,
          { status: "enrolled", at: now },
        ] as Prisma.InputJsonValue);
        logger.info(
          {
            module: "engagement",
            action: "STUDENT_REFERRAL_NOT_PAID",
            referralId: referral.id,
            base,
            percentage,
          },
          "Student referral enrolled but payout is zero",
        );
        return;
      }

      const card = await StudentReferralRepository.findCardByStudentId(
        tx,
        referral.referrerStudentId,
      );
      if (!card || card.status !== "active") {
        await StudentReferralRepository.markEnrolledUnpaid(tx, referral.id, [
          ...statusHistory,
          { status: "enrolled", at: now },
        ] as Prisma.InputJsonValue);
        logger.warn(
          {
            referralId: referral.id,
            referrerStudentId: referral.referrerStudentId,
          },
          "Referring student has no active BeaconU Card — payout skipped",
        );
        return;
      }

      await StudentReferralRepository.markPaid(tx, referral.id, {
        statusHistory: [
          ...statusHistory,
          { status: "enrolled", at: now },
          { status: "paid", at: now },
        ] as Prisma.InputJsonValue,
        payoutBaseAmount: base,
        payoutPercentage: percentage,
        payoutAmount: payout,
      });

      await StudentReferralRepository.creditCard(tx, {
        cardId: card.id,
        studentId: referral.referrerStudentId,
        studentReferralId: referral.id,
        amount: payout,
        description: "Referral reward",
      });

      logger.info(
        {
          module: "engagement",
          action: "STUDENT_REFERRAL_CREDITED",
          referralId: referral.id,
          referrerStudentId: referral.referrerStudentId,
          payout,
        },
        "Student referral credited on enrollment",
      );
    } catch (error) {
      logger.warn(
        { error, referredStudentId },
        "Failed to credit student referral for enrollment — continuing",
      );
    }
  }
}
