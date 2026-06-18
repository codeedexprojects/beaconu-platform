import { CryptoUtils } from "@/shared/utils";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/shared/errors";
import { ACCOUNT_STATUS, AccountStatus } from "@/shared/constants";
import { BLINK_ROLES } from "../blink.permissions";
import { BlinkRepository } from "../repositories/blink.repository";
import {
  RegisterAssociateEmployeeInput,
  RegisterAmbassadorInput,
  UpdateEmployeeStatusInput,
  BankDetailsInput,
  WithdrawalInput,
  UpdateServiceChargeInput,
} from "../validators/blink.validator";

export class BlinkService {
  static async registerAssociateEmployee(data: RegisterAssociateEmployeeInput) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingEmail = await BlinkRepository.findByEmail(normalizedEmail);
    if (existingEmail) throw new ConflictError("Email already exists");

    const parentUser = await BlinkRepository.findById(data.associate_parent_id);
    if (!parentUser) throw new NotFoundError("Associate admin not found");
    if (parentUser.blinkRole.slug !== BLINK_ROLES.ASSOCIATE_ADMIN) {
      throw new ForbiddenError("Parent user must be an associate admin");
    }

    const role = await BlinkRepository.findRoleBySlug(
      BLINK_ROLES.ASSOCIATE_EMPLOYEE,
    );
    if (!role) throw new NotFoundError("Blink role not found");

    const passwordHash = await CryptoUtils.hash(data.password);

    const user = await BlinkRepository.create({
      fullName: data.full_name,
      email: normalizedEmail,
      passwordHash,
      phoneNumber: data.phone_number,
      associateParentId: data.associate_parent_id,
      roleId: role.id,
      status: ACCOUNT_STATUS.ACTIVE,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        roleSlug: user.blinkRole.slug,
      },
      message:
        "Registration submitted. Your account is pending approval by your admin.",
    };
  }

  static async registerAmbassador(
    data: RegisterAmbassadorInput,
    createdByStaffId: string,
    staffCollegeId: string,
  ) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingEmail = await BlinkRepository.findByEmail(normalizedEmail);
    if (existingEmail) throw new ConflictError("Email already exists");

    if (staffCollegeId !== data.college_id) {
      throw new ForbiddenError(
        "Campus ambassador can only be created for your own college",
      );
    }

    const role = await BlinkRepository.findRoleBySlug(
      BLINK_ROLES.CAMPUS_AMBASSADOR,
    );
    if (!role) throw new NotFoundError("Blink role not found");

    const [passwordHash, campusCode] = await Promise.all([
      CryptoUtils.hash(data.password),
      BlinkRepository.getNextAmbassadorCode(),
    ]);

    const user = await BlinkRepository.create({
      fullName: data.full_name,
      email: normalizedEmail,
      passwordHash,
      phoneNumber: data.phone_number,
      collegeId: data.college_id,
      linkedStudentId: data.linked_student_id,
      ambassadorType: data.ambassador_type,
      campusCode,
      createdByStaffId,
      roleId: role.id,
      status: ACCOUNT_STATUS.ACTIVE,
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      collegeId: user.collegeId,
      ambassadorType: user.ambassadorType,
      campusCode: user.campusCode,
      roleSlug: user.blinkRole.slug,
      status: user.status,
    };
  }

  static async listAssociateEmployees(associateAdminId: string) {
    const employees =
      await BlinkRepository.findEmployeesByParent(associateAdminId);
    return employees.map((e) => ({
      id: e.id,
      fullName: e.fullName,
      email: e.email,
      phoneNumber: e.phoneNumber,
      status: e.status,
      roleSlug: e.blinkRole.slug,
      createdAt: e.createdAt,
    }));
  }

  static async listPendingEmployees(associateAdminId: string) {
    const employees = await BlinkRepository.findEmployeesByParent(
      associateAdminId,
      ACCOUNT_STATUS.PENDING_APPROVAL,
    );
    return employees.map((e) => ({
      id: e.id,
      fullName: e.fullName,
      email: e.email,
      phoneNumber: e.phoneNumber,
      status: e.status,
      roleSlug: e.blinkRole.slug,
      createdAt: e.createdAt,
    }));
  }

  static async updateAssociateEmployeeStatus(
    associateAdminId: string,
    employeeId: string,
    data: UpdateEmployeeStatusInput,
  ) {
    const employee = await BlinkRepository.findById(employeeId);
    if (!employee) throw new NotFoundError("Employee not found");
    if (employee.blinkRole.slug !== BLINK_ROLES.ASSOCIATE_EMPLOYEE) {
      throw new ForbiddenError("Target user is not an associate employee");
    }
    if (employee.associateParentId !== associateAdminId) {
      throw new ForbiddenError("You can only update your own employees");
    }

    const updated = await BlinkRepository.updateStatus(employeeId, data.status);
    return {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      status: updated.status,
      roleSlug: updated.blinkRole.slug,
    };
  }

  static async getProfile(userId: string) {
    const [user, wallet] = await Promise.all([
      BlinkRepository.findById(userId),
      BlinkRepository.getWalletByUserId(userId),
    ]);
    if (!user) throw new NotFoundError("User not found");
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      agencyName: user.agencyName,
      associateParentId: user.associateParentId,
      collegeId: user.collegeId,
      roleSlug: user.blinkRole.slug,
      status: user.status,
      walletBalance: wallet ? Number(wallet.balance) : 0,
    };
  }

  static async getEmployeePerformance(adminId: string, employeeId: string) {
    const employee = await BlinkRepository.findEmployeePerformanceData(
      employeeId,
      adminId,
    );
    if (!employee) throw new NotFoundError("Employee not found");

    const { referrals, commissions } = employee;
    const total = referrals.length;
    const byStatus = {
      registered: referrals.filter((r) => r.status === "registered").length,
      confirmed: referrals.filter((r) => r.status === "confirmed").length,
      rejected: referrals.filter((r) => r.status === "rejected").length,
      dropped_out: referrals.filter((r) => r.status === "dropped_out").length,
    };
    const commissionEarned = commissions
      .filter((c) => c.status === "credited")
      .reduce((sum, c) => sum + Number(c.netPayout), 0);
    const commissionPending = commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + Number(c.netPayout), 0);

    return {
      id: employee.id,
      fullName: employee.fullName,
      email: employee.email,
      status: employee.status,
      roleSlug: employee.blinkRole.slug,
      referrals: {
        total,
        byStatus,
        conversionRate:
          total > 0 ? Number((byStatus.confirmed / total).toFixed(4)) : 0,
      },
      commission: {
        earned: commissionEarned,
        pending: commissionPending,
      },
    };
  }

  static async getOwnPerformance(employeeId: string) {
    const employee = await BlinkRepository.findOwnPerformanceData(employeeId);
    if (!employee) throw new NotFoundError("User not found");

    const { referrals, commissions } = employee;
    const total = referrals.length;
    const byStatus = {
      registered: referrals.filter((r) => r.status === "registered").length,
      confirmed: referrals.filter((r) => r.status === "confirmed").length,
      rejected: referrals.filter((r) => r.status === "rejected").length,
      dropped_out: referrals.filter((r) => r.status === "dropped_out").length,
    };
    const commissionEarned = commissions
      .filter((c) => c.status === "credited")
      .reduce((sum, c) => sum + Number(c.netPayout), 0);
    const commissionPending = commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + Number(c.netPayout), 0);

    return {
      referrals: {
        total,
        byStatus,
        conversionRate:
          total > 0 ? Number((byStatus.confirmed / total).toFixed(4)) : 0,
      },
      commission: {
        earned: commissionEarned,
        pending: commissionPending,
      },
    };
  }

  static async getStudentByReferral(adminId: string, referralId: string) {
    const row = await BlinkRepository.findReferralWithStudentForAdmin(
      referralId,
      adminId,
    );
    if (!row) throw new NotFoundError("Referral not found");

    return {
      id: row.student.id,
      fullName: row.student.fullName,
      email: row.student.email ?? null,
      phoneNumber: row.student.phoneNumber ?? null,
      avatarUrl: row.student.avatarUrl ?? null,
      status: row.student.status,
      createdAt: row.student.createdAt.toISOString(),
      referral: {
        id: row.id,
        status: row.status,
        commission: row.commission
          ? {
              id: row.commission.id,
              netPayout: Number(row.commission.netPayout),
              status: row.commission.status,
            }
          : null,
        createdAt: row.createdAt.toISOString(),
      },
    };
  }

  static async getStudentByReferralForEmployee(
    employeeId: string,
    referralId: string,
  ) {
    const row = await BlinkRepository.findReferralWithStudentForEmployee(
      referralId,
      employeeId,
    );
    if (!row) throw new NotFoundError("Referral not found");

    return {
      id: row.student.id,
      fullName: row.student.fullName,
      email: row.student.email ?? null,
      phoneNumber: row.student.phoneNumber ?? null,
      avatarUrl: row.student.avatarUrl ?? null,
      status: row.student.status,
      createdAt: row.student.createdAt.toISOString(),
      referral: {
        id: row.id,
        status: row.status,
        commission: row.commission
          ? {
              id: row.commission.id,
              netPayout: Number(row.commission.netPayout),
              status: row.commission.status,
            }
          : null,
        createdAt: row.createdAt.toISOString(),
      },
    };
  }

  static async getWallet(userId: string) {
    const wallet = await BlinkRepository.getWalletByUserId(userId);
    if (!wallet) {
      return {
        id: null,
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        bankDetails: null,
        updatedAt: null,
      };
    }
    const raw = wallet.bankDetails as Record<string, string> | null;
    const bankDetails =
      raw && Object.keys(raw).length > 0
        ? (raw as {
            accountHolderName: string;
            accountNumber: string;
            ifsc: string;
            bankName: string;
          })
        : null;
    return {
      id: wallet.id,
      balance: Number(wallet.balance),
      totalEarned: Number(wallet.totalEarned),
      totalWithdrawn: Number(wallet.totalWithdrawn),
      bankDetails,
      updatedAt: wallet.updatedAt.toISOString(),
    };
  }

  static async getWalletTransactions(
    userId: string,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    const { total, transactions } = await BlinkRepository.getWalletTransactions(
      userId,
      skip,
      limit,
    );
    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        description: t.description ?? null,
        withdrawalStatus: t.withdrawalStatus ?? null,
        balanceAfter: Number(t.balanceAfter),
        createdAt: t.createdAt.toISOString(),
      })),
      meta: { total, page, limit, hasNext: skip + limit < total },
    };
  }

  static async updateBankDetails(userId: string, data: BankDetailsInput) {
    const wallet = await BlinkRepository.getWalletByUserId(userId);
    if (!wallet)
      throw new NotFoundError("Wallet not found. No earnings recorded yet.");
    await BlinkRepository.updateBankDetails(userId, data);
    return data;
  }

  static async requestWithdrawal(userId: string, data: WithdrawalInput) {
    const wallet = await BlinkRepository.getWalletByUserId(userId);
    if (!wallet) {
      throw new ValidationError(
        "No earnings wallet found. Nothing to withdraw.",
      );
    }
    const available = Number(wallet.balance);
    if (data.amount > available) {
      throw new ValidationError(
        `Insufficient balance. Available: ₹${available.toFixed(2)}`,
      );
    }
    const result = await BlinkRepository.processWithdrawal(
      userId,
      data.amount,
      data.description ?? "Withdrawal request",
    );
    return {
      transactionId: result.transaction.id,
      amount: Number(result.transaction.amount),
      withdrawalStatus: result.transaction.withdrawalStatus,
      balanceAfter: Number(result.wallet.balance),
    };
  }

  static async updateServiceCharge(id: string, data: UpdateServiceChargeInput) {
    const existing = await BlinkRepository.findServiceChargeById(id);
    if (!existing) throw new NotFoundError("Service charge config not found");

    const grossAmount =
      data.grossAmount !== undefined
        ? data.grossAmount
        : Number(existing.grossAmount);
    const gstPercentage =
      data.gstPercentage !== undefined
        ? data.gstPercentage
        : Number(existing.gstPercentage);
    const amountsChanged =
      data.grossAmount !== undefined || data.gstPercentage !== undefined;
    const gstAmount = (grossAmount * gstPercentage) / 100;
    const netPayout = grossAmount - gstAmount;

    const updated = await BlinkRepository.updateServiceCharge(id, {
      ...(data.grossAmount !== undefined ? { grossAmount } : {}),
      ...(data.gstPercentage !== undefined ? { gstPercentage } : {}),
      ...(amountsChanged ? { gstAmount, netPayout } : {}),
      ...(data.termsAndConditions !== undefined
        ? { termsAndConditions: data.termsAndConditions }
        : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    });

    return {
      id: updated.id,
      college: { id: updated.college.id, name: updated.college.name },
      course: updated.course
        ? { id: updated.course.id, name: updated.course.name }
        : null,
      academicYear: updated.academicYear,
      studentCategory: updated.studentCategory,
      grossAmount: Number(updated.grossAmount),
      gstPercentage: Number(updated.gstPercentage),
      gstAmount: Number(updated.gstAmount),
      netPayout: Number(updated.netPayout),
      termsAndConditions: updated.termsAndConditions ?? null,
      isActive: updated.isActive,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  static async updateBlinkUserStatus(id: string, status: AccountStatus) {
    const user = await BlinkRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");

    return await BlinkRepository.updateStatus(id, status);
  }

  static async listCampusAmbassadors(collegeId: string) {
    const ambassadors =
      await BlinkRepository.findAmbassadorsByCollege(collegeId);
    return ambassadors.map((a) => ({
      id: a.id,
      fullName: a.fullName,
      email: a.email,
      phoneNumber: a.phoneNumber,
      avatarUrl: a.avatarUrl,
      ambassadorType: a.ambassadorType,
      campusCode: a.campusCode,
      status: a.status,
      createdAt: a.createdAt,
    }));
  }
}
