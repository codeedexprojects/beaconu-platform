import { prisma, Prisma } from "@beaconu/db";

const BANK_ACCOUNT_SELECT = {
  id: true,
  bankName: true,
  accountHolderName: true,
  accountNumberLast4: true,
  ifscCode: true,
  accountType: true,
  isPrimary: true,
  isVerified: true,
  createdAt: true,
} as const;

export class WalletRepository {
  // ── Bank accounts ─────────────────────────────────────────────────────────

  static async listBankAccounts(studentId: string) {
    return prisma.studentBankAccount.findMany({
      where: { studentId },
      select: BANK_ACCOUNT_SELECT,
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    });
  }

  static async findBankAccount(id: string, studentId: string) {
    return prisma.studentBankAccount.findFirst({
      where: { id, studentId },
    });
  }

  static async createBankAccount(data: {
    studentId: string;
    bankName: string;
    accountHolderName: string;
    accountNumberEncrypted: string;
    accountNumberLast4: string;
    ifscCode: string;
    accountType: string;
    isPrimary: boolean;
  }) {
    return prisma.$transaction(async (tx) => {
      if (data.isPrimary) {
        await tx.studentBankAccount.updateMany({
          where: { studentId: data.studentId },
          data: { isPrimary: false },
        });
      }
      const count = await tx.studentBankAccount.count({
        where: { studentId: data.studentId },
      });
      return tx.studentBankAccount.create({
        // First account is always primary, so there is always a default.
        data: { ...data, isPrimary: data.isPrimary || count === 0 },
        select: BANK_ACCOUNT_SELECT,
      });
    });
  }

  static async setPrimaryBankAccount(id: string, studentId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.studentBankAccount.updateMany({
        where: { studentId },
        data: { isPrimary: false },
      });
      return tx.studentBankAccount.update({
        where: { id },
        data: { isPrimary: true },
        select: BANK_ACCOUNT_SELECT,
      });
    });
  }

  // ── Redemption ────────────────────────────────────────────────────────────

  /** Balance is held against pending requests, not debited — the debit
   * happens on approval. */
  static async createRedemptionRequest(data: {
    studentId: string;
    amount: number;
    bankAccountId: string;
    payoutDetails: Prisma.InputJsonValue;
    description: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const card = await tx.beaconuCard.findUnique({
        where: { studentId: data.studentId },
        select: { id: true, balance: true, status: true },
      });
      if (!card) return { error: "no_card" as const };
      if (card.status !== "active") return { error: "card_inactive" as const };

      const pending = await tx.studentWalletTransaction.aggregate({
        where: {
          studentId: data.studentId,
          type: "debit",
          withdrawalStatus: "pending",
        },
        _sum: { amount: true },
      });

      const available = Number(card.balance) - Number(pending._sum.amount ?? 0);
      if (available < data.amount) {
        return { error: "insufficient" as const, available };
      }

      const transaction = await tx.studentWalletTransaction.create({
        data: {
          cardId: card.id,
          studentId: data.studentId,
          type: "debit",
          amount: data.amount,
          description: data.description,
          bankAccountId: data.bankAccountId,
          payoutDetails: data.payoutDetails,
          withdrawalStatus: "pending",
          balanceAfter: card.balance,
        },
      });

      return { transaction, available };
    });
  }

  static async findRedemptionById(id: string) {
    return prisma.studentWalletTransaction.findFirst({
      where: { id, type: "debit" },
      select: {
        id: true,
        studentId: true,
        cardId: true,
        amount: true,
        withdrawalStatus: true,
      },
    });
  }

  /** Records a payout that was already made by hand. */
  static async approveRedemption(
    id: string,
    studentId: string,
    amount: number,
    adminId: string,
    remarks: string | undefined,
  ) {
    return prisma.$transaction(async (tx) => {
      const card = await tx.beaconuCard.update({
        where: { studentId },
        data: {
          balance: { decrement: amount },
          totalWithdrawn: { increment: amount },
        },
        select: { balance: true },
      });

      return tx.studentWalletTransaction.update({
        where: { id },
        data: {
          withdrawalStatus: "approved",
          reviewedBy: adminId,
          reviewRemarks: remarks,
          reviewedAt: new Date(),
          balanceAfter: card.balance,
        },
      });
    });
  }

  /** No balance change: nothing was debited, the hold simply lifts. */
  static async rejectRedemption(
    id: string,
    adminId: string,
    remarks: string | undefined,
  ) {
    return prisma.studentWalletTransaction.update({
      where: { id },
      data: {
        withdrawalStatus: "rejected",
        reviewedBy: adminId,
        reviewRemarks: remarks,
        reviewedAt: new Date(),
      },
    });
  }
}
