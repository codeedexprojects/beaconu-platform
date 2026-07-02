import { prisma } from "@beaconu/db";
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

  static async findReferralWithStudentForAdmin(
    referralId: string,
    adminId: string,
  ) {
    return prisma.referral.findFirst({
      where: {
        id: referralId,
        blinkUser: { associateParentId: adminId },
      },
      include: {
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
          select: { id: true, netPayout: true, status: true },
        },
      },
    });
  }

  static async findReferralWithStudentForEmployee(
    referralId: string,
    employeeId: string,
  ) {
    return prisma.referral.findFirst({
      where: { id: referralId, blinkUserId: employeeId },
      include: {
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
          select: { id: true, netPayout: true, status: true },
        },
      },
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
  ) {
    const [total, transactions] = await Promise.all([
      prisma.blinkWalletTransaction.count({ where: { blinkUserId } }),
      prisma.blinkWalletTransaction.findMany({
        where: { blinkUserId },
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
}
