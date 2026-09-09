import { prisma } from "@beaconu/db";
import { PaginationHelper } from "@/shared/responses/pagination";
import type { WalletTransactionQuery } from "../validators/student-referral.validator";

export class StudentReferralQuery {
  /** Headline numbers for the referral screen. `pending` is money the student
   * will get once an invitee enrolls — it is deliberately not part of the
   * card balance, which only ever reflects settled credits. */
  static async getEarningsSummary(studentId: string) {
    const [grouped, card] = await Promise.all([
      prisma.studentReferral.groupBy({
        by: ["status"],
        where: { referrerStudentId: studentId },
        _count: { _all: true },
        _sum: { payoutAmount: true },
      }),
      prisma.beaconuCard.findUnique({
        where: { studentId },
        select: { balance: true, totalEarned: true },
      }),
    ]);

    const countFor = (status: string) =>
      grouped.find((g) => g.status === status)?._count._all ?? 0;

    const totalEarned = grouped.reduce(
      (sum, g) => sum + Number(g._sum.payoutAmount ?? 0),
      0,
    );

    return {
      totalInvites: grouped.reduce((sum, g) => sum + g._count._all, 0),
      signedUp: countFor("signed_up"),
      enrolled: countFor("enrolled"),
      paid: countFor("paid"),
      totalEarned,
      cardBalance: card ? Number(card.balance) : 0,
    };
  }

  static async listWalletTransactions(
    studentId: string,
    filters: WalletTransactionQuery,
  ) {
    const { page, limit, type } = filters;
    const skip = (page - 1) * limit;
    const where = { studentId, ...(type ? { type } : {}) };

    const [total, rows] = await Promise.all([
      prisma.studentWalletTransaction.count({ where }),
      prisma.studentWalletTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          withdrawalStatus: true,
          balanceAfter: true,
          createdAt: true,
          studentReferral: {
            select: {
              id: true,
              payoutPercentage: true,
              payoutBaseAmount: true,
              referredStudent: { select: { fullName: true } },
            },
          },
        },
      }),
    ]);

    return {
      transactions: rows.map((t) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        description: t.description,
        withdrawalStatus: t.withdrawalStatus,
        balanceAfter: Number(t.balanceAfter),
        createdAt: t.createdAt.toISOString(),
        // Present only on referral credits — lets the app answer "why this
        // amount?" without a second call.
        referral: t.studentReferral
          ? {
              id: t.studentReferral.id,
              referredStudentName: t.studentReferral.referredStudent.fullName,
              baseAmount:
                t.studentReferral.payoutBaseAmount != null
                  ? Number(t.studentReferral.payoutBaseAmount)
                  : null,
              percentage:
                t.studentReferral.payoutPercentage != null
                  ? Number(t.studentReferral.payoutPercentage)
                  : null,
            }
          : null,
      })),
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }
}
