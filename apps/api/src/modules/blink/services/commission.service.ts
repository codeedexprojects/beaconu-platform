import { Prisma } from "@beaconu/db";
import { logger } from "@/shared/lib/logger";
import { BlinkRepository } from "../repositories/blink.repository";

export class BlinkCommissionService {
  /**
   * Credits the referring blink_user's commission at the moment a student
   * enrolls, inside the caller's enrollment transaction. Commission is a flat
   * amount entered on the course at creation time — not derived from any fee.
   * Never throws: a referral/commission issue must never block enrollment.
   */
  static async creditCommissionForEnrollment(
    tx: Prisma.TransactionClient,
    applicationCourseId: string,
    referralCommissionAmount: Prisma.Decimal | number | null,
  ) {
    try {
      const referral = await BlinkRepository.findReferralByApplicationCourseId(
        tx,
        applicationCourseId,
      );
      if (!referral) return;

      const grossAmount = Number(referralCommissionAmount ?? 0);
      if (grossAmount <= 0) return;

      const gstAmount = 0;
      const netPayout = grossAmount;

      const statusHistory = Array.isArray(referral.statusHistory)
        ? referral.statusHistory
        : [];
      await BlinkRepository.updateReferralStatus(tx, referral.id, "enrolled", [
        ...statusHistory,
        { status: "enrolled", at: new Date().toISOString() },
      ] as Prisma.InputJsonValue);

      const commission = await BlinkRepository.createCommission(tx, {
        referralId: referral.id,
        blinkUserId: referral.blinkUserId,
        grossAmount,
        gstAmount,
        netPayout,
        status: "credited",
      });

      await BlinkRepository.creditWallet(
        tx,
        referral.blinkUserId,
        commission.id,
        netPayout,
      );

      logger.info(
        {
          referralId: referral.id,
          blinkUserId: referral.blinkUserId,
          commissionId: commission.id,
          netPayout,
        },
        "Commission credited for enrollment",
      );
    } catch (error) {
      logger.warn(
        { error, applicationCourseId },
        "Failed to credit referral commission for enrollment — continuing",
      );
    }
  }
}
