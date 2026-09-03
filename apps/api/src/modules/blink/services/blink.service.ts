import { prisma } from "@beaconu/db";
import { logger } from "@/shared/lib/logger";
import { PaginationHelper } from "@/shared/responses/pagination";
import { CryptoUtils, generateShortCode } from "@/shared/utils";
import { buildCollegeReferralUrl } from "@/shared/utils/college-url.utils";
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
  UpdateAmbassadorInput,
  AmbassadorProfileUpdateInput,
  BankDetailsInput,
  WithdrawalInput,
  UpdateServiceChargeInput,
  CreateReferralCodeInput,
  ListWithdrawalRequestsQueryInput,
  UpdateWithdrawalStatusInput,
} from "../validators/blink.validator";

function mapAmbassadorDto(a: {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  ambassadorType: string | null;
  campusCode: string | null;
  status: string;
  createdAt: Date;
  profileMetadata: unknown;
}) {
  const meta =
    a.profileMetadata &&
    typeof a.profileMetadata === "object" &&
    !Array.isArray(a.profileMetadata)
      ? (a.profileMetadata as Record<string, unknown>)
      : {};
  return {
    id: a.id,
    fullName: a.fullName,
    email: a.email,
    phoneNumber: a.phoneNumber,
    avatarUrl: a.avatarUrl,
    ambassadorType: a.ambassadorType,
    campusCode: a.campusCode,
    status: a.status,
    createdAt: a.createdAt,
    course: typeof meta.course === "string" ? meta.course : null,
    district: typeof meta.district === "string" ? meta.district : null,
    state: typeof meta.state === "string" ? meta.state : null,
  };
}

function mapAmbassadorSelfProfile(
  a: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
    ambassadorType: string | null;
    campusCode: string | null;
    collegeId: string | null;
    status: string;
    createdAt: Date;
    profileMetadata: unknown;
  },
  wallet: { bankDetails: unknown } | null,
) {
  const meta =
    a.profileMetadata &&
    typeof a.profileMetadata === "object" &&
    !Array.isArray(a.profileMetadata)
      ? (a.profileMetadata as Record<string, unknown>)
      : {};

  const rawBankDetails = wallet?.bankDetails as Record<string, string> | null;
  const bankDetails =
    rawBankDetails && Object.keys(rawBankDetails).length > 0
      ? (rawBankDetails as {
          accountHolderName: string;
          accountNumber: string;
          ifsc: string;
          bankName: string;
        })
      : null;

  return {
    id: a.id,
    fullName: a.fullName,
    email: a.email,
    phoneNumber: a.phoneNumber,
    avatarUrl: a.avatarUrl,
    ambassadorType: a.ambassadorType,
    campusCode: a.campusCode,
    collegeId: a.collegeId,
    status: a.status,
    createdAt: a.createdAt,
    course: typeof meta.course === "string" ? meta.course : null,
    language: typeof meta.language === "string" ? meta.language : null,
    district: typeof meta.district === "string" ? meta.district : null,
    state: typeof meta.state === "string" ? meta.state : null,
    bankDetails,
  };
}

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
        roleSlug: role.slug,
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

    const profileMetadata: Record<string, unknown> = {};
    if (data.course) profileMetadata.course = data.course;
    if (data.district) profileMetadata.district = data.district;
    if (data.state) profileMetadata.state = data.state;

    const user = await BlinkRepository.create({
      fullName: data.full_name,
      email: normalizedEmail,
      passwordHash,
      phoneNumber: data.phone_number,
      collegeId: data.college_id,
      linkedStudentId: data.linked_student_id,
      ambassadorType: data.ambassador_type,
      avatarUrl: data.avatar_url ?? null,
      profileMetadata: Object.keys(profileMetadata).length
        ? profileMetadata
        : undefined,
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
      roleSlug: role.slug,
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

  /** Human labels for the ApplicationCourse status pipeline, in the order the
   * "Referred Student Detail" screen's progress timeline expects. Statuses
   * not in this map (e.g. rejected/dropped_out) are shown with their raw
   * value rather than dropped, so nothing silently disappears. */
  private static readonly TIMELINE_STEP_LABELS: Record<string, string> = {
    submitted: "Application completed",
    under_review: "Application under review",
    eligibility_check: "Eligibility check",
    assessment_pending: "Assessment scheduled",
    assessment_completed: "Assessment completed",
    interview_pending: "Interview scheduled",
    interview_completed: "Interview completed",
    shortlisted: "Shortlisted",
    offer_issued: "Offer letter issued",
    token_paid: "Token fee payment",
    enrolled: "Admission confirmed",
  };

  private static mapReferralDetail(
    row: NonNullable<
      Awaited<
        ReturnType<typeof BlinkRepository.findReferralWithStudentForAdmin>
      >
    >,
  ) {
    const applicationCourse = row.applicationCourse;

    const timeline = [
      // Every referral starts here — not an ApplicationCourse status, so it's
      // seeded from the referral's own creation, matching "Referral link
      // shared" as the first step regardless of what happens afterward.
      { label: "Referral link shared", at: row.createdAt.toISOString() },
      ...(applicationCourse?.statusLogs.map((log) => ({
        label: this.TIMELINE_STEP_LABELS[log.toStatus] ?? log.toStatus,
        at: log.createdAt.toISOString(),
      })) ?? []),
    ];

    const fees =
      applicationCourse?.studentFeeLedger.map((entry) => ({
        label: entry.description || entry.feeCategory,
        amount: Number(entry.netAmount),
        paidAmount: Number(entry.paidAmount),
        status: entry.status,
        paymentMethod: entry.transactions[0]?.paymentMethod ?? null,
        paidAt: entry.transactions[0]?.paidAt?.toISOString() ?? null,
      })) ?? [];
    const totalFeesCleared = fees.reduce((sum, f) => sum + f.paidAmount, 0);

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
        currentStatus: applicationCourse?.status ?? row.status,
        timeline,
        fees: { items: fees, totalCleared: totalFeesCleared },
        academicDetails: applicationCourse
          ? {
              courseName: applicationCourse.course.name,
              collegeName: applicationCourse.application.college.name,
              intake:
                applicationCourse.application.admissionCycle?.admissionYear ??
                null,
              studyMode: applicationCourse.course.studyMode,
            }
          : null,
        commission: row.commission
          ? {
              id: row.commission.id,
              netPayout: Number(row.commission.netPayout),
              status: row.commission.status,
              payoutDueDate:
                row.commission.payoutDueDate?.toISOString() ?? null,
              paidAt: row.commission.paidAt?.toISOString() ?? null,
            }
          : null,
        createdAt: row.createdAt.toISOString(),
      },
    };
  }

  static async getStudentByReferral(adminId: string, referralId: string) {
    const row = await BlinkRepository.findReferralWithStudentForAdmin(
      referralId,
      adminId,
    );
    if (!row) throw new NotFoundError("Referral not found");
    return this.mapReferralDetail(row);
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
    return this.mapReferralDetail(row);
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
    type?: "credit" | "debit",
  ) {
    const skip = (page - 1) * limit;
    const { total, transactions } = await BlinkRepository.getWalletTransactions(
      userId,
      skip,
      limit,
      type,
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

  static async generateReferralCode(
    blinkUserId: string,
    data: CreateReferralCodeInput,
  ) {
    const college = await BlinkRepository.findCollegeById(data.collegeId);
    if (!college) throw new NotFoundError("College not found");

    const courseId = data.courseId ?? null;
    if (courseId) {
      const course = await BlinkRepository.findCourseInCollege(
        courseId,
        data.collegeId,
      );
      if (!course) throw new NotFoundError("Course not found in this college");
    }

    const existing =
      await BlinkRepository.findActiveReferralCodeByUserCollegeCourse(
        blinkUserId,
        data.collegeId,
        courseId,
      );
    if (existing) return existing;

    // The @@unique(blinkUserId, collegeId, courseId) constraint allows only
    // one row for this triple ever — if a previous code here was
    // deactivated, that row still occupies the slot, so a plain create()
    // would violate the constraint. Reactivate it with a fresh code instead.
    const inactiveSlot =
      await BlinkRepository.findAnyReferralCodeByUserCollegeCourse(
        blinkUserId,
        data.collegeId,
        courseId,
      );

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateShortCode();
      const existingCode =
        await BlinkRepository.findReferralCodeByCodeValue(code);
      if (existingCode) continue;

      const referralUrl = buildCollegeReferralUrl(college.slug, code);
      try {
        return inactiveSlot
          ? await BlinkRepository.reactivateReferralCode(inactiveSlot.id, {
              code,
              referralUrl,
            })
          : await BlinkRepository.createReferralCode({
              blinkUserId,
              collegeId: data.collegeId,
              courseId,
              code,
              referralUrl,
            });
      } catch (error) {
        // Unique-constraint race on `code` — retry with a fresh code.
        if (attempt === 4) throw error;
      }
    }
    throw new ConflictError("Could not generate a unique referral code, retry");
  }

  static async listOwnReferralCodes(blinkUserId: string) {
    const codes = await BlinkRepository.findReferralCodesByUser(blinkUserId);
    return codes.map((c) => ({
      id: c.id,
      code: c.code,
      referralUrl: c.referralUrl,
      collegeId: c.collegeId,
      collegeName: c.college.name,
      courseId: c.courseId,
      totalClicks: c.totalClicks,
      totalRegistrations: c.totalRegistrations,
      isActive: c.isActive,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  static async deactivateReferralCode(blinkUserId: string, codeId: string) {
    const code = await BlinkRepository.findReferralCodeById(codeId);
    if (!code || code.blinkUserId !== blinkUserId) {
      throw new NotFoundError("Referral code not found");
    }
    const updated = await BlinkRepository.updateReferralCodeActive(
      codeId,
      false,
    );
    return { id: updated.id, isActive: updated.isActive };
  }

  static async listWithdrawalRequests(query: ListWithdrawalRequestsQueryInput) {
    const { status, page, limit } = query;
    const { rows, total } = await BlinkRepository.listWithdrawalRequests(
      { status },
      page,
      limit,
    );

    return {
      requests: rows.map((r) => ({
        id: r.id,
        blinkUser: {
          id: r.blinkUser.id,
          fullName: r.blinkUser.fullName,
          email: r.blinkUser.email,
        },
        amount: Number(r.amount),
        withdrawalStatus: r.withdrawalStatus,
        description: r.description ?? null,
        reviewRemarks: r.reviewRemarks ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }

  static async updateWithdrawalStatus(
    transactionId: string,
    data: UpdateWithdrawalStatusInput,
    adminId: string,
  ) {
    const transaction =
      await BlinkRepository.findWithdrawalTransactionById(transactionId);
    if (!transaction || transaction.withdrawalStatus === null) {
      throw new NotFoundError("Withdrawal request not found");
    }
    if (transaction.withdrawalStatus !== "pending") {
      throw new ConflictError(
        "This withdrawal request has already been reviewed",
      );
    }

    const amount = Number(transaction.amount);
    const updated =
      data.status === "approved"
        ? await BlinkRepository.approveWithdrawal(
            transactionId,
            adminId,
            data.remarks,
          )
        : await BlinkRepository.rejectWithdrawal(
            transactionId,
            transaction.blinkUserId,
            amount,
            adminId,
            data.remarks,
          );

    logger.info(
      {
        transactionId,
        blinkUserId: transaction.blinkUserId,
        status: updated.withdrawalStatus,
        adminId,
      },
      "Blink withdrawal request reviewed",
    );

    return {
      id: updated.id,
      withdrawalStatus: updated.withdrawalStatus,
      reviewRemarks: updated.reviewRemarks ?? null,
    };
  }

  static async resolveReferralCode(code: string) {
    const referralCode =
      await BlinkRepository.findReferralCodeByCodeWithDetails(code);
    if (!referralCode || !referralCode.isActive) {
      throw new NotFoundError("Referral code not found");
    }
    await BlinkRepository.incrementReferralCodeClicks(referralCode.id);
    return {
      isValid: true,
      collegeSlug: referralCode.college.slug,
      collegeName: referralCode.college.name,
      courseId: referralCode.course?.id ?? null,
      courseName: referralCode.course?.name ?? null,
    };
  }

  /**
   * Best-effort referral attachment at application-start time. Never throws —
   * a bad/expired referral code, or any other failure here, must not prevent
   * the student's application from being created.
   */
  static async attachReferral(
    studentId: string,
    applicationId: string,
    applicationCourseId: string,
    referralCode: string,
  ) {
    try {
      const code =
        await BlinkRepository.findActiveReferralCodeByCode(referralCode);
      if (!code) return;

      await prisma.application.update({
        where: { id: applicationId },
        data: { referralCodeId: code.id },
      });

      const existingReferral =
        await BlinkRepository.findExistingReferralForStudentAndUser(
          studentId,
          code.blinkUserId,
        );
      if (existingReferral) return;

      await BlinkRepository.createReferral({
        referralCodeId: code.id,
        blinkUserId: code.blinkUserId,
        studentId,
        applicationCourseId,
        status: "registered",
        statusHistory: [{ status: "registered", at: new Date().toISOString() }],
      });

      logger.info(
        { studentId, applicationId, referralCodeId: code.id },
        "Referral attached to application",
      );
    } catch (error) {
      logger.warn(
        { error, studentId, applicationId, referralCode },
        "Failed to attach referral to application — continuing without it",
      );
    }
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
    return ambassadors.map(mapAmbassadorDto);
  }

  static async getAmbassadorForCollege(
    ambassadorId: string,
    collegeId: string,
  ) {
    const ambassador = await BlinkRepository.findById(ambassadorId);
    if (
      !ambassador ||
      ambassador.blinkRole.slug !== BLINK_ROLES.CAMPUS_AMBASSADOR
    ) {
      throw new NotFoundError("Campus ambassador not found");
    }
    if (ambassador.collegeId !== collegeId) {
      throw new NotFoundError("Campus ambassador not found");
    }
    return mapAmbassadorDto(ambassador);
  }

  static async updateAmbassador(
    ambassadorId: string,
    collegeId: string,
    data: UpdateAmbassadorInput,
  ) {
    const ambassador = await BlinkRepository.findById(ambassadorId);
    if (
      !ambassador ||
      ambassador.blinkRole.slug !== BLINK_ROLES.CAMPUS_AMBASSADOR
    ) {
      throw new NotFoundError("Campus ambassador not found");
    }
    if (ambassador.collegeId !== collegeId) {
      throw new NotFoundError("Campus ambassador not found");
    }

    const existingMeta =
      ambassador.profileMetadata &&
      typeof ambassador.profileMetadata === "object" &&
      !Array.isArray(ambassador.profileMetadata)
        ? (ambassador.profileMetadata as Record<string, unknown>)
        : {};
    const profileMetadata: Record<string, string | number | boolean | null> = {
      ...existingMeta,
    } as Record<string, string | number | boolean | null>;
    if (data.course !== undefined) profileMetadata.course = data.course;
    if (data.district !== undefined) profileMetadata.district = data.district;
    if (data.state !== undefined) profileMetadata.state = data.state;

    const passwordHash = data.password
      ? await CryptoUtils.hash(data.password)
      : undefined;

    const updated = await BlinkRepository.updateProfile(ambassadorId, {
      fullName: data.full_name,
      phoneNumber: data.phone_number,
      ambassadorType: data.ambassador_type,
      avatarUrl: data.avatar_url,
      status: data.status,
      passwordHash,
      profileMetadata,
    });

    return mapAmbassadorDto(updated);
  }

  static async getAmbassadorProfile(ambassadorId: string) {
    const [ambassador, wallet] = await Promise.all([
      BlinkRepository.findById(ambassadorId),
      BlinkRepository.getWalletByUserId(ambassadorId),
    ]);
    if (
      !ambassador ||
      ambassador.blinkRole.slug !== BLINK_ROLES.CAMPUS_AMBASSADOR
    ) {
      throw new NotFoundError("Campus ambassador not found");
    }
    return mapAmbassadorSelfProfile(ambassador, wallet);
  }

  static async updateAmbassadorProfile(
    ambassadorId: string,
    data: AmbassadorProfileUpdateInput,
  ) {
    const ambassador = await BlinkRepository.findById(ambassadorId);
    if (
      !ambassador ||
      ambassador.blinkRole.slug !== BLINK_ROLES.CAMPUS_AMBASSADOR
    ) {
      throw new NotFoundError("Campus ambassador not found");
    }

    const existingMeta =
      ambassador.profileMetadata &&
      typeof ambassador.profileMetadata === "object" &&
      !Array.isArray(ambassador.profileMetadata)
        ? (ambassador.profileMetadata as Record<string, unknown>)
        : {};
    const profileMetadata: Record<string, string | number | boolean | null> = {
      ...existingMeta,
    } as Record<string, string | number | boolean | null>;
    if (data.course !== undefined) profileMetadata.course = data.course;
    if (data.language !== undefined) profileMetadata.language = data.language;
    if (data.district !== undefined) profileMetadata.district = data.district;
    if (data.state !== undefined) profileMetadata.state = data.state;

    const updated = await BlinkRepository.updateProfile(ambassadorId, {
      fullName: data.full_name,
      phoneNumber: data.phone_number,
      avatarUrl: data.avatar_url,
      profileMetadata,
    });

    if (data.bank_details) {
      await BlinkRepository.upsertBankDetails(ambassadorId, data.bank_details);
    }

    const wallet = await BlinkRepository.getWalletByUserId(ambassadorId);
    return mapAmbassadorSelfProfile(updated, wallet);
  }

  static async listPublicCampusAmbassadors(collegeId: string) {
    const ambassadors =
      await BlinkRepository.findActiveAmbassadorsByCollegePublic(collegeId);

    return ambassadors.map((a) => {
      const meta =
        a.profileMetadata &&
        typeof a.profileMetadata === "object" &&
        !Array.isArray(a.profileMetadata)
          ? (a.profileMetadata as Record<string, unknown>)
          : {};
      return {
        name: a.fullName,
        image: a.avatarUrl ?? "",
        state: typeof meta.state === "string" ? meta.state : "",
        course: typeof meta.course === "string" ? meta.course : "",
        district: typeof meta.district === "string" ? meta.district : "",
        message_link:
          typeof meta.message_link === "string" ? meta.message_link : "",
      };
    });
  }

  /** Throws unless the given user is an active campus ambassador belonging to collegeId. */
  static async assertAmbassadorInCollege(
    ambassadorId: string,
    collegeId: string,
  ) {
    const ambassador = await BlinkRepository.findById(ambassadorId);
    if (
      !ambassador ||
      ambassador.blinkRole.slug !== BLINK_ROLES.CAMPUS_AMBASSADOR ||
      ambassador.status !== ACCOUNT_STATUS.ACTIVE
    ) {
      throw new NotFoundError("Selected ambassador not found");
    }
    if (ambassador.collegeId !== collegeId) {
      throw new ForbiddenError(
        "Selected ambassador does not belong to this college",
      );
    }
  }
}
