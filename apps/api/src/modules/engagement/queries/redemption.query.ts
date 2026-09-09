import { prisma } from "@beaconu/db";
import { PaginationHelper } from "@/shared/responses/pagination";
import { NotFoundError } from "@/shared/errors";
import { EncryptionUtils } from "@/shared/utils/encryption.utils";
import type { ListRedemptionsQuery } from "../validators/wallet.validator";

export class RedemptionQuery {
  /** Masked account number only; the full one comes from getPayoutDetails. */
  static async listForAdmin(filters: ListRedemptionsQuery) {
    const { page, limit, status } = filters;
    const skip = (page - 1) * limit;
    const where = {
      type: "debit",
      ...(status
        ? { withdrawalStatus: status }
        : { withdrawalStatus: { not: null } }),
    };

    const [total, rows] = await Promise.all([
      prisma.studentWalletTransaction.count({ where }),
      prisma.studentWalletTransaction.findMany({
        where,
        skip,
        take: limit,
        // Oldest first: this is a work queue.
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          amount: true,
          withdrawalStatus: true,
          payoutDetails: true,
          reviewRemarks: true,
          reviewedAt: true,
          createdAt: true,
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
            },
          },
          card: { select: { cardNumber: true, balance: true } },
        },
      }),
    ]);

    return {
      requests: rows.map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        status: r.withdrawalStatus,
        payoutDetails: r.payoutDetails,
        reviewRemarks: r.reviewRemarks,
        reviewedAt: r.reviewedAt?.toISOString() ?? null,
        requestedAt: r.createdAt.toISOString(),
        student: r.student,
        card: r.card
          ? {
              cardNumber: r.card.cardNumber,
              balance: Number(r.card.balance),
            }
          : null,
      })),
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }

  /** The only place a bank account number is decrypted. */
  static async getPayoutDetails(id: string) {
    const request = await prisma.studentWalletTransaction.findFirst({
      where: { id, type: "debit" },
      select: {
        id: true,
        amount: true,
        withdrawalStatus: true,
        createdAt: true,
        payoutDetails: true,
        student: { select: { id: true, fullName: true, phoneNumber: true } },
        bankAccount: {
          select: {
            bankName: true,
            accountHolderName: true,
            accountNumberEncrypted: true,
            accountNumberLast4: true,
            ifscCode: true,
            accountType: true,
          },
        },
      },
    });

    if (!request || request.withdrawalStatus === null) {
      throw new NotFoundError("Redemption request");
    }

    let accountNumber: string | null = null;
    if (request.bankAccount?.accountNumberEncrypted) {
      try {
        accountNumber = EncryptionUtils.decrypt(
          request.bankAccount.accountNumberEncrypted,
        );
      } catch {
        // Tampered or key-rotated ciphertext — fall back to the mask.
        accountNumber = null;
      }
    }

    return {
      id: request.id,
      amount: Number(request.amount),
      status: request.withdrawalStatus,
      requestedAt: request.createdAt.toISOString(),
      student: request.student,
      snapshot: request.payoutDetails,
      account: request.bankAccount
        ? {
            bankName: request.bankAccount.bankName,
            accountHolderName: request.bankAccount.accountHolderName,
            accountNumber,
            accountNumberLast4: request.bankAccount.accountNumberLast4,
            ifscCode: request.bankAccount.ifscCode,
            accountType: request.bankAccount.accountType,
          }
        : null,
    };
  }
}
