import { prisma, Prisma } from "@beaconu/db";

export class StudentReferralRepository {
  static async findCodeByStudent(studentId: string) {
    return prisma.studentReferralCode.findUnique({ where: { studentId } });
  }

  static async findActiveCodeByValue(code: string) {
    return prisma.studentReferralCode.findFirst({
      where: { code, isActive: true },
      select: { id: true, studentId: true },
    });
  }

  static async findCodeByValue(code: string) {
    return prisma.studentReferralCode.findUnique({
      where: { code },
      select: { id: true },
    });
  }

  static async createCode(data: {
    studentId: string;
    code: string;
    shareUrl: string;
  }) {
    return prisma.studentReferralCode.create({ data });
  }

  static async incrementClicks(id: string) {
    return prisma.studentReferralCode.update({
      where: { id },
      data: { totalClicks: { increment: 1 } },
    });
  }

  static async findReferralForReferredStudent(referredStudentId: string) {
    return prisma.studentReferral.findUnique({
      where: { referredStudentId },
      select: { id: true },
    });
  }

  static async createReferral(data: {
    referralCodeId: string;
    referrerStudentId: string;
    referredStudentId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const referral = await tx.studentReferral.create({
        data: {
          ...data,
          status: "signed_up",
          statusHistory: [
            { status: "signed_up", at: new Date().toISOString() },
          ] as Prisma.InputJsonValue,
        },
      });
      await tx.studentReferralCode.update({
        where: { id: data.referralCodeId },
        data: { totalSignups: { increment: 1 } },
      });
      return referral;
    });
  }

  static async hasActiveEnrollment(studentId: string) {
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId, status: "active" },
      select: { id: true },
    });
    return enrollment !== null;
  }

  static async listReferralsByReferrer(referrerStudentId: string) {
    return prisma.studentReferral.findMany({
      where: { referrerStudentId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        payoutAmount: true,
        paidAt: true,
        createdAt: true,
        referredStudent: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });
  }

  static async countSignupsForCode(referrerStudentId: string) {
    return prisma.studentReferral.count({ where: { referrerStudentId } });
  }

  // ── Payout (tx-bound, runs inside the enrollment transaction) ─────────────

  /** Looked up by the referred student, NOT by application course: student
   * referrals are attached at signup, long before any application exists. */
  static async findUnpaidReferralForStudent(
    tx: Prisma.TransactionClient,
    referredStudentId: string,
  ) {
    return tx.studentReferral.findFirst({
      where: {
        referredStudentId,
        status: { in: ["signed_up", "enrolled"] },
        paidAt: null,
      },
      select: { id: true, referrerStudentId: true, statusHistory: true },
    });
  }

  static async markPaid(
    tx: Prisma.TransactionClient,
    referralId: string,
    data: {
      statusHistory: Prisma.InputJsonValue;
      payoutBaseAmount: number;
      payoutPercentage: number;
      payoutAmount: number;
    },
  ) {
    return tx.studentReferral.update({
      where: { id: referralId },
      data: {
        status: "paid",
        paidAt: new Date(),
        ...data,
      },
    });
  }

  static async markEnrolledUnpaid(
    tx: Prisma.TransactionClient,
    referralId: string,
    statusHistory: Prisma.InputJsonValue,
  ) {
    return tx.studentReferral.update({
      where: { id: referralId },
      data: { status: "enrolled", statusHistory },
    });
  }

  static async findCardByStudentId(
    tx: Prisma.TransactionClient,
    studentId: string,
  ) {
    return tx.beaconuCard.findUnique({
      where: { studentId },
      select: { id: true, status: true },
    });
  }

  static async creditCard(
    tx: Prisma.TransactionClient,
    data: {
      cardId: string;
      studentId: string;
      studentReferralId: string;
      amount: number;
      description: string;
    },
  ) {
    const card = await tx.beaconuCard.update({
      where: { id: data.cardId },
      data: {
        balance: { increment: data.amount },
        totalEarned: { increment: data.amount },
      },
      select: { balance: true },
    });

    return tx.studentWalletTransaction.create({
      data: {
        cardId: data.cardId,
        studentId: data.studentId,
        studentReferralId: data.studentReferralId,
        type: "credit",
        amount: data.amount,
        description: data.description,
        balanceAfter: card.balance,
      },
    });
  }
}
