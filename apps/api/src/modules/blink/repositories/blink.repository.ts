import { prisma, Prisma } from "@beaconu/db";
import { BlinkUserCreateData } from "../validators/blink.validator";

export class BlinkRepository {
  static async findByEmail(email: string) {
    return prisma.blinkUser.findUnique({
      where: { email },
      include: { blinkRole: true },
    });
  }

  static async findByRegNumber(regNumber: string) {
    return prisma.blinkUser.findUnique({
      where: { agencyRegNumber: regNumber },
    });
  }

  static async findById(id: string) {
    return prisma.blinkUser.findUnique({
      where: { id },
      include: { blinkRole: true },
    });
  }

  static async getNextAmbassadorCode(): Promise<string> {
    const result = await prisma.$queryRaw<[{ code: string }]>`
      SELECT 'CA-' || nextval('ambassador_code_seq'::regclass)::text AS code
    `;
    return result[0].code;
  }

  static async create(data: BlinkUserCreateData) {
    return prisma.blinkUser.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash,
        phoneNumber: data.phoneNumber,
        country: data.country,
        agencyName: data.agencyName,
        agencyRegNumber: data.agencyRegNumber,
        associateParentId: data.associateParentId,
        collegeId: data.collegeId,
        linkedStudentId: data.linkedStudentId,
        ambassadorType: data.ambassadorType,
        campusCode: data.campusCode,
        createdByStaffId: data.createdByStaffId,
        blinkRoleId: data.roleId,
        status: data.status,
        avatarUrl: data.avatarUrl ?? null,
        profileMetadata: data.profileMetadata as
          | Record<string, string | number | boolean | null>
          | undefined,
      },
      include: { blinkRole: true },
    });
  }

  static async updateLastLogin(id: string) {
    return prisma.blinkUser.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  static async updateProfile(
    id: string,
    data: {
      fullName?: string;
      phoneNumber?: string;
      ambassadorType?: string;
      avatarUrl?: string | null;
      status?: string;
      passwordHash?: string;
      profileMetadata?: Record<string, string | number | boolean | null>;
    },
  ) {
    return prisma.blinkUser.update({
      where: { id },
      data,
      include: { blinkRole: true },
    });
  }

  static async findEmployeesByParent(
    associateParentId: string,
    status?: string,
  ) {
    return prisma.blinkUser.findMany({
      where: {
        associateParentId,
        ...(status ? { status } : {}),
      },
      include: { blinkRole: true },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateStatus(id: string, status: string) {
    return prisma.blinkUser.update({
      where: { id },
      data: { status },
      include: { blinkRole: true },
    });
  }

  static async findRoleBySlug(slug: string) {
    return prisma.blinkRole.findUnique({ where: { slug } });
  }

  private static readonly REFERRAL_DETAIL_INCLUDE = {
    student: {
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
      },
    },
    commission: {
      select: {
        id: true,
        netPayout: true,
        status: true,
        payoutDueDate: true,
        paidAt: true,
      },
    },
    applicationCourse: {
      select: {
        id: true,
        status: true,
        course: {
          select: {
            name: true,
            studyMode: true,
          },
        },
        application: {
          select: {
            college: { select: { name: true } },
            admissionCycle: { select: { admissionYear: true } },
          },
        },
        statusLogs: {
          orderBy: { createdAt: "asc" as const },
          select: { fromStatus: true, toStatus: true, createdAt: true },
        },
        studentFeeLedger: {
          orderBy: { createdAt: "asc" as const },
          select: {
            feeCategory: true,
            description: true,
            netAmount: true,
            paidAmount: true,
            status: true,
            transactions: {
              where: { status: "completed" },
              orderBy: { paidAt: "desc" as const },
              take: 1,
              select: { paymentMethod: true, paidAt: true },
            },
          },
        },
      },
    },
  } satisfies Prisma.ReferralInclude;

  static async findReferralWithStudentForAdmin(
    referralId: string,
    adminId: string,
  ) {
    return prisma.referral.findFirst({
      where: {
        id: referralId,
        blinkUser: { associateParentId: adminId },
      },
      include: this.REFERRAL_DETAIL_INCLUDE,
    });
  }

  static async findReferralWithStudentForEmployee(
    referralId: string,
    employeeId: string,
  ) {
    return prisma.referral.findFirst({
      where: { id: referralId, blinkUserId: employeeId },
      include: this.REFERRAL_DETAIL_INCLUDE,
    });
  }

  static async findServiceChargeById(id: string) {
    return prisma.serviceChargeConfig.findUnique({ where: { id } });
  }

  static async updateServiceCharge(
    id: string,
    data: {
      grossAmount?: number;
      gstPercentage?: number;
      gstAmount?: number;
      netPayout?: number;
      termsAndConditions?: string;
      isActive?: boolean;
    },
  ) {
    return prisma.serviceChargeConfig.update({
      where: { id },
      data,
      include: {
        college: { select: { id: true, name: true } },
        course: { select: { id: true, name: true } },
      },
    });
  }

  static async findEmployeePerformanceData(
    employeeId: string,
    adminId: string,
  ) {
    return prisma.blinkUser.findFirst({
      where: { id: employeeId, associateParentId: adminId },
      include: {
        blinkRole: { select: { slug: true } },
        referrals: { select: { id: true, status: true } },
        commissions: { select: { netPayout: true, status: true } },
      },
    });
  }

  static async findOwnPerformanceData(employeeId: string) {
    return prisma.blinkUser.findUnique({
      where: { id: employeeId },
      include: {
        blinkRole: { select: { slug: true } },
        referrals: { select: { id: true, status: true } },
        commissions: { select: { netPayout: true, status: true } },
      },
    });
  }

  static async getWalletByUserId(blinkUserId: string) {
    return prisma.blinkWallet.findUnique({ where: { blinkUserId } });
  }

  static async getWalletTransactions(
    blinkUserId: string,
    skip: number,
    take: number,
    type?: "credit" | "debit",
  ) {
    const where = { blinkUserId, ...(type ? { type } : {}) };
    const [total, transactions] = await Promise.all([
      prisma.blinkWalletTransaction.count({ where }),
      prisma.blinkWalletTransaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          withdrawalStatus: true,
          balanceAfter: true,
          createdAt: true,
        },
      }),
    ]);
    return { total, transactions };
  }

  static async updateBankDetails(blinkUserId: string, bankDetails: object) {
    return prisma.blinkWallet.update({
      where: { blinkUserId },
      data: { bankDetails },
    });
  }

  static async upsertBankDetails(blinkUserId: string, bankDetails: object) {
    return prisma.blinkWallet.upsert({
      where: { blinkUserId },
      create: { blinkUserId, bankDetails },
      update: { bankDetails },
    });
  }

  static async processWithdrawal(
    blinkUserId: string,
    amount: number,
    description: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.blinkWallet.update({
        where: { blinkUserId },
        data: {
          balance: { decrement: amount },
          totalWithdrawn: { increment: amount },
        },
      });
      const transaction = await tx.blinkWalletTransaction.create({
        data: {
          walletId: wallet.id,
          blinkUserId,
          type: "debit",
          amount,
          description,
          withdrawalStatus: "pending",
          balanceAfter: wallet.balance,
        },
      });
      return { wallet, transaction };
    });
  }

  static async findAmbassadorsByCollege(collegeId: string) {
    return prisma.blinkUser.findMany({
      where: {
        collegeId,
        blinkRole: { slug: "campus_ambassador" },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        ambassadorType: true,
        campusCode: true,
        status: true,
        createdAt: true,
        profileMetadata: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findCollegeById(collegeId: string) {
    return prisma.college.findUnique({
      where: { id: collegeId },
      select: { id: true, name: true, slug: true },
    });
  }

  static async findCourseInCollege(courseId: string, collegeId: string) {
    return prisma.course.findFirst({
      where: { id: courseId, collegeId },
      select: { id: true, name: true },
    });
  }

  static async findActiveReferralCodeByUserCollegeCourse(
    blinkUserId: string,
    collegeId: string,
    courseId: string | null,
  ) {
    // Always filter by isActive here — the @@unique constraint on
    // (blinkUserId, collegeId, courseId) means there's at most one row for
    // this triple, so a plain findUnique/findFirst-without-isActive would
    // keep returning a deactivated code forever and block ever creating a
    // fresh one for the same college+course. findUnique can't express a
    // secondary filter alongside a compound-unique `where`, so both branches
    // use findFirst here (courseId: null is handled the same way Prisma's
    // compound-unique lookup can't take null for a nullable member anyway).
    return prisma.referralCode.findFirst({
      where: { blinkUserId, collegeId, courseId, isActive: true },
    });
  }

  static async createReferralCode(data: {
    blinkUserId: string;
    collegeId: string;
    courseId: string | null;
    code: string;
    referralUrl: string;
  }) {
    return prisma.referralCode.create({ data });
  }

  /** Any row (active or not) for this triple — the @@unique constraint
   * allows only one, so this is what createReferralCode must check before
   * inserting, to decide between create and reactivate. */
  static async findAnyReferralCodeByUserCollegeCourse(
    blinkUserId: string,
    collegeId: string,
    courseId: string | null,
  ) {
    return prisma.referralCode.findFirst({
      where: { blinkUserId, collegeId, courseId },
    });
  }

  /** Reactivates a previously-deactivated code slot with a fresh code/url —
   * used instead of create() when the unique (blinkUserId, collegeId,
   * courseId) triple is already occupied by an inactive row. */
  static async reactivateReferralCode(
    id: string,
    data: { code: string; referralUrl: string },
  ) {
    return prisma.referralCode.update({
      where: { id },
      data: { ...data, isActive: true, totalClicks: 0, totalRegistrations: 0 },
    });
  }

  static async findReferralCodeByCodeValue(code: string) {
    return prisma.referralCode.findUnique({ where: { code } });
  }

  static async findReferralCodeByCodeWithDetails(code: string) {
    return prisma.referralCode.findUnique({
      where: { code },
      include: {
        college: { select: { slug: true, name: true } },
        course: { select: { id: true, name: true } },
      },
    });
  }

  static async incrementReferralCodeClicks(id: string) {
    return prisma.referralCode.update({
      where: { id },
      data: { totalClicks: { increment: 1 } },
    });
  }

  static async findActiveReferralCodeByCode(code: string) {
    return prisma.referralCode.findFirst({
      where: { code, isActive: true },
    });
  }

  static async findExistingReferralForStudentAndUser(
    studentId: string,
    blinkUserId: string,
  ) {
    return prisma.referral.findUnique({
      where: { uq_referral_student: { studentId, blinkUserId } },
    });
  }

  static async createReferral(data: {
    referralCodeId: string;
    blinkUserId: string;
    studentId: string;
    applicationCourseId: string;
    status: string;
    statusHistory: Array<{ status: string; at: string }>;
  }) {
    return prisma.$transaction(async (tx) => {
      const referral = await tx.referral.create({ data });
      await tx.referralCode.update({
        where: { id: data.referralCodeId },
        data: { totalRegistrations: { increment: 1 } },
      });
      return referral;
    });
  }

  static async findReferralCodesByUser(blinkUserId: string) {
    return prisma.referralCode.findMany({
      where: { blinkUserId },
      include: { college: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findReferralCodeById(id: string) {
    return prisma.referralCode.findUnique({ where: { id } });
  }

  static async updateReferralCodeActive(id: string, isActive: boolean) {
    return prisma.referralCode.update({ where: { id }, data: { isActive } });
  }

  static async findActiveAmbassadorsByCollegePublic(collegeId: string) {
    return prisma.blinkUser.findMany({
      where: {
        collegeId,
        blinkRole: { slug: "campus_ambassador" },
        status: "active",
      },
      select: {
        fullName: true,
        avatarUrl: true,
        profileMetadata: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ── Commission (enrollment-time, tx-bound) ─────────────────────────────────

  static async findReferralByApplicationCourseId(
    tx: Prisma.TransactionClient,
    applicationCourseId: string,
  ) {
    return tx.referral.findUnique({ where: { applicationCourseId } });
  }

  static async updateReferralStatus(
    tx: Prisma.TransactionClient,
    referralId: string,
    status: string,
    statusHistory: Prisma.InputJsonValue,
  ) {
    return tx.referral.update({
      where: { id: referralId },
      data: { status, statusHistory, statusUpdatedAt: new Date() },
    });
  }

  static async createCommission(
    tx: Prisma.TransactionClient,
    data: {
      referralId: string;
      blinkUserId: string;
      grossAmount: number;
      gstAmount: number;
      netPayout: number;
      status: string;
    },
  ) {
    return tx.commission.create({ data: { ...data, serviceChargeId: null } });
  }

  static async creditWallet(
    tx: Prisma.TransactionClient,
    blinkUserId: string,
    commissionId: string,
    amount: number,
  ) {
    const wallet = await tx.blinkWallet.upsert({
      where: { blinkUserId },
      create: { blinkUserId, balance: amount, totalEarned: amount },
      update: {
        balance: { increment: amount },
        totalEarned: { increment: amount },
      },
    });
    return tx.blinkWalletTransaction.create({
      data: {
        walletId: wallet.id,
        blinkUserId,
        type: "credit",
        amount,
        description: "Commission for enrollment",
        commissionId,
        balanceAfter: wallet.balance,
      },
    });
  }

  // ── Withdrawal approval (platform-admin) ───────────────────────────────────

  static async listWithdrawalRequests(
    filters: { status?: string },
    page: number,
    limit: number,
  ) {
    const where: Prisma.BlinkWalletTransactionWhereInput = {
      type: "debit",
      withdrawalStatus: filters.status ?? { not: null },
    };
    const skip = (page - 1) * limit;

    const [total, rows] = await Promise.all([
      prisma.blinkWalletTransaction.count({ where }),
      prisma.blinkWalletTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          blinkUser: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
    ]);

    return { rows, total };
  }

  static async findWithdrawalTransactionById(id: string) {
    return prisma.blinkWalletTransaction.findUnique({
      where: { id },
      include: {
        blinkUser: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  /** No wallet change — processWithdrawal already debited the balance at
   * request time, so approving just confirms the payout went out. */
  static async approveWithdrawal(
    transactionId: string,
    adminId: string,
    remarks: string | undefined,
  ) {
    return prisma.blinkWalletTransaction.update({
      where: { id: transactionId },
      data: {
        withdrawalStatus: "approved",
        reviewedBy: adminId,
        reviewRemarks: remarks,
      },
    });
  }

  /** Reverses the earlier eager debit from processWithdrawal, since the
   * money never actually left. */
  static async rejectWithdrawal(
    transactionId: string,
    blinkUserId: string,
    amount: number,
    adminId: string,
    remarks: string | undefined,
  ) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.blinkWallet.update({
        where: { blinkUserId },
        data: {
          balance: { increment: amount },
          totalWithdrawn: { decrement: amount },
        },
      });

      return tx.blinkWalletTransaction.update({
        where: { id: transactionId },
        data: {
          withdrawalStatus: "rejected",
          reviewedBy: adminId,
          reviewRemarks: remarks,
          balanceAfter: wallet.balance,
        },
      });
    });
  }
}
