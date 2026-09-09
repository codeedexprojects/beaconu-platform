import { Prisma } from "@beaconu/db";
import { logger } from "@/shared/lib/logger";
import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors";
import { EncryptionUtils } from "@/shared/utils/encryption.utils";
import { PlatformConfigService } from "@/modules/platform-config/services/platform-config.service";
import { PushService } from "@/modules/notifications/services/push.service";
import { WalletRepository } from "../repositories/wallet.repository";
import type {
  CreateBankAccountInput,
  RequestRedemptionInput,
  ReviewRedemptionInput,
} from "../validators/wallet.validator";

// Payouts are made by hand by a super admin; nothing here moves money.
export class WalletService {
  static async listBankAccounts(studentId: string) {
    return WalletRepository.listBankAccounts(studentId);
  }

  static async addBankAccount(studentId: string, data: CreateBankAccountInput) {
    return WalletRepository.createBankAccount({
      studentId,
      bankName: data.bankName,
      accountHolderName: data.accountHolderName,
      accountNumberEncrypted: EncryptionUtils.encrypt(data.accountNumber),
      accountNumberLast4: EncryptionUtils.last4(data.accountNumber),
      ifscCode: data.ifscCode,
      accountType: data.accountType,
      isPrimary: data.isPrimary,
    });
  }

  static async setPrimaryBankAccount(studentId: string, id: string) {
    const account = await WalletRepository.findBankAccount(id, studentId);
    if (!account) throw new NotFoundError("Bank account");
    return WalletRepository.setPrimaryBankAccount(id, studentId);
  }

  static async requestRedemption(
    studentId: string,
    data: RequestRedemptionInput,
  ) {
    const config = await PlatformConfigService.getConfig();
    const minimum = Number(config.studentMinWithdrawalAmount ?? 0);
    if (data.amount < minimum) {
      throw new ValidationError(
        `Minimum redemption amount is ₹${minimum.toFixed(2)}`,
      );
    }

    const account = await WalletRepository.findBankAccount(
      data.bankAccountId,
      studentId,
    );
    if (!account) throw new NotFoundError("Bank account");

    // Snapshot, masked — the full number stays in the encrypted column.
    const payoutDetails: Prisma.InputJsonValue = {
      bankName: account.bankName,
      accountHolderName: account.accountHolderName,
      accountNumberLast4: account.accountNumberLast4,
      ifscCode: account.ifscCode,
      accountType: account.accountType,
    };

    const result = await WalletRepository.createRedemptionRequest({
      studentId,
      amount: data.amount,
      bankAccountId: data.bankAccountId,
      payoutDetails,
      description: "Redemption request",
    });

    if ("error" in result) {
      if (result.error === "no_card") {
        throw new ValidationError("No BeaconU Card found. Nothing to redeem.");
      }
      if (result.error === "card_inactive") {
        throw new ConflictError("Your BeaconU Card is not active");
      }
      throw new ValidationError(
        `Insufficient balance. Available: ₹${result.available.toFixed(2)}`,
      );
    }

    logger.info(
      {
        module: "engagement",
        action: "REDEMPTION_REQUESTED",
        studentId,
        transactionId: result.transaction.id,
        amount: data.amount,
      },
      "BeaconU Card redemption requested",
    );

    return {
      id: result.transaction.id,
      amount: Number(result.transaction.amount),
      withdrawalStatus: result.transaction.withdrawalStatus,
      requestedAt: result.transaction.createdAt.toISOString(),
    };
  }

  static async reviewRedemption(
    id: string,
    data: ReviewRedemptionInput,
    adminId: string,
  ) {
    const request = await WalletRepository.findRedemptionById(id);
    if (!request || request.withdrawalStatus === null) {
      throw new NotFoundError("Redemption request");
    }
    if (request.withdrawalStatus !== "pending") {
      throw new ConflictError(
        "This redemption request has already been reviewed",
      );
    }

    const amount = Number(request.amount);
    const updated =
      data.status === "approved"
        ? await WalletRepository.approveRedemption(
            id,
            request.studentId,
            amount,
            adminId,
            data.remarks,
          )
        : await WalletRepository.rejectRedemption(id, adminId, data.remarks);

    logger.info(
      {
        module: "engagement",
        action: "REDEMPTION_REVIEWED",
        transactionId: id,
        studentId: request.studentId,
        status: updated.withdrawalStatus,
        adminId,
        amount,
      },
      "BeaconU Card redemption reviewed",
    );

    await WalletService.notifyReviewed(
      request.studentId,
      data.status,
      amount,
      data.remarks,
    );

    return {
      id: updated.id,
      withdrawalStatus: updated.withdrawalStatus,
      reviewRemarks: updated.reviewRemarks ?? null,
      reviewedAt: updated.reviewedAt?.toISOString() ?? null,
    };
  }

  /** Never throws: the approval is already committed and paid out. */
  private static async notifyReviewed(
    studentId: string,
    status: "approved" | "rejected",
    amount: number,
    remarks: string | undefined,
  ) {
    try {
      await PushService.sendToUser(studentId, "student", {
        title:
          status === "approved" ? "Redemption approved" : "Redemption declined",
        body:
          status === "approved"
            ? `₹${amount.toFixed(2)} is on its way to your bank account.`
            : remarks
              ? `Your ₹${amount.toFixed(2)} redemption was declined: ${remarks}`
              : `Your ₹${amount.toFixed(2)} redemption request was declined.`,
        data: { type: "redemption_reviewed", status },
      });
    } catch (error) {
      logger.error(
        { err: error, studentId },
        "Failed to notify student of redemption review",
      );
    }
  }
}
