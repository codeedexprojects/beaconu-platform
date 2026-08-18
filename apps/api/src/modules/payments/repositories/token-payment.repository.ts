import { randomUUID } from "crypto";
import { prisma, Prisma } from "@beaconu/db";

const TRANSACTION_SELECT = {
  id: true,
  transactionNumber: true,
  studentId: true,
  collegeId: true,
  ledgerEntryId: true,
  amount: true,
  currency: true,
  paymentMethod: true,
  razorpayOrderId: true,
  razorpayPaymentId: true,
  status: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const OFFLINE_TRANSACTION_SELECT = {
  ...TRANSACTION_SELECT,
  uploadProofUrl: true,
  uploadProofFileName: true,
  ddNumber: true,
  ddBankName: true,
  ddDate: true,
  bankRefNumber: true,
  studentNote: true,
  verificationStatus: true,
  verifiedBy: true,
  verifiedAt: true,
  rejectionReason: true,
  ledgerEntry: {
    select: { id: true, applicationCourseId: true, feeCategory: true },
  },
} as const;

export class TokenPaymentRepository {
  static async findApplicationCourseForPayment(
    applicationCourseId: string,
    studentId: string,
  ) {
    return prisma.applicationCourse.findFirst({
      where: { id: applicationCourseId, application: { studentId } },
      select: {
        id: true,
        status: true,
        courseId: true,
        application: {
          select: {
            id: true,
            collegeId: true,
            admissionCycleId: true,
            admissionCycle: {
              select: {
                tokenOnlinePaymentEnabled: true,
                tokenOfflinePaymentEnabled: true,
              },
            },
          },
        },
      },
    });
  }

  static async findConfiguredTokenAmount(
    admissionCycleId: string,
    courseId: string,
  ) {
    return prisma.admissionCycleCourse.findUnique({
      where: { uq_cycle_course: { admissionCycleId, courseId } },
      select: { tokenAmount: true },
    });
  }

  static async findPendingTransaction(applicationCourseId: string) {
    return prisma.transaction.findFirst({
      where: {
        status: "pending",
        ledgerEntry: { feeCategory: "token_fee", applicationCourseId },
      },
      select: TRANSACTION_SELECT,
    });
  }

  static async findLedgerEntry(applicationCourseId: string) {
    return prisma.studentFeeLedger.findFirst({
      where: { feeCategory: "token_fee", applicationCourseId },
      select: {
        id: true,
        netAmount: true,
        paidAmount: true,
        balanceAmount: true,
        status: true,
      },
    });
  }

  static async createLedgerEntry(data: {
    studentId: string;
    collegeId: string;
    applicationCourseId: string;
    amount: number;
  }) {
    return prisma.studentFeeLedger.create({
      data: {
        studentId: data.studentId,
        collegeId: data.collegeId,
        applicationCourseId: data.applicationCourseId,
        feeCategory: "token_fee",
        description: "Admission token payment",
        totalAmount: data.amount,
        netAmount: data.amount,
        balanceAmount: data.amount,
      },
      select: {
        id: true,
        netAmount: true,
        paidAmount: true,
        balanceAmount: true,
        status: true,
      },
    });
  }

  static async markLedgerPaid(
    tx: Prisma.TransactionClient,
    ledgerEntryId: string,
    paidAmount: number,
  ) {
    return tx.studentFeeLedger.update({
      where: { id: ledgerEntryId },
      data: { paidAmount, balanceAmount: 0, status: "paid" },
      select: { id: true },
    });
  }

  static async createTransaction(data: {
    studentId: string;
    collegeId: string;
    ledgerEntryId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    razorpayOrderId: string;
    gatewayResponse: unknown;
  }) {
    const placeholder = randomUUID().replace(/-/g, "").slice(0, 30);
    return prisma.transaction.create({
      data: {
        transactionNumber: placeholder,
        studentId: data.studentId,
        collegeId: data.collegeId,
        ledgerEntryId: data.ledgerEntryId,
        amount: data.amount,
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        razorpayOrderId: data.razorpayOrderId,
        gatewayResponse: data.gatewayResponse as Prisma.InputJsonValue,
        verificationStatus: "not_required",
      },
      select: TRANSACTION_SELECT,
    });
  }

  static async setTransactionNumber(id: string, transactionNumber: string) {
    return prisma.transaction.update({
      where: { id },
      data: { transactionNumber },
      select: TRANSACTION_SELECT,
    });
  }

  static async findById(id: string) {
    return prisma.transaction.findUnique({
      where: { id },
      select: {
        ...TRANSACTION_SELECT,
        ledgerEntry: {
          select: { id: true, applicationCourseId: true, feeCategory: true },
        },
      },
    });
  }

  static async markPaid(
    tx: Prisma.TransactionClient,
    id: string,
    providerPaymentId: string,
  ) {
    return tx.transaction.update({
      where: { id },
      data: {
        status: "completed",
        razorpayPaymentId: providerPaymentId,
        paidAt: new Date(),
      },
      select: TRANSACTION_SELECT,
    });
  }

  static async markFailed(id: string) {
    return prisma.transaction.update({
      where: { id },
      data: { status: "failed" },
      select: { id: true },
    });
  }

  static async createOfflineTransaction(data: {
    studentId: string;
    collegeId: string;
    ledgerEntryId: string;
    amount: number;
    paymentMethod: "demand_draft" | "bank_transfer";
    uploadProofUrl: string;
    uploadProofFileName?: string;
    ddNumber?: string;
    ddBankName?: string;
    ddDate?: Date;
    bankRefNumber?: string;
    studentNote?: string;
  }) {
    const placeholder = randomUUID().replace(/-/g, "").slice(0, 30);
    return prisma.transaction.create({
      data: {
        transactionNumber: placeholder,
        studentId: data.studentId,
        collegeId: data.collegeId,
        ledgerEntryId: data.ledgerEntryId,
        amount: data.amount,
        currency: "INR",
        paymentMethod: data.paymentMethod,
        uploadProofUrl: data.uploadProofUrl,
        uploadProofFileName: data.uploadProofFileName,
        ddNumber: data.ddNumber,
        ddBankName: data.ddBankName,
        ddDate: data.ddDate,
        bankRefNumber: data.bankRefNumber,
        studentNote: data.studentNote,
        verificationStatus: "pending_verification",
        status: "pending",
      },
      select: OFFLINE_TRANSACTION_SELECT,
    });
  }

  static async updateOfflineSubmission(
    id: string,
    data: {
      amount: number;
      paymentMethod: "demand_draft" | "bank_transfer";
      uploadProofUrl: string;
      uploadProofFileName?: string;
      ddNumber?: string;
      ddBankName?: string;
      ddDate?: Date;
      bankRefNumber?: string;
      studentNote?: string;
    },
  ) {
    return prisma.transaction.update({
      where: { id },
      data: {
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        uploadProofUrl: data.uploadProofUrl,
        uploadProofFileName: data.uploadProofFileName,
        ddNumber: data.ddNumber,
        ddBankName: data.ddBankName,
        ddDate: data.ddDate,
        bankRefNumber: data.bankRefNumber,
        studentNote: data.studentNote,
        status: "pending",
        verificationStatus: "pending_verification",
      },
      select: OFFLINE_TRANSACTION_SELECT,
    });
  }

  static async findOfflineById(id: string) {
    return prisma.transaction.findUnique({
      where: { id },
      select: OFFLINE_TRANSACTION_SELECT,
    });
  }

  static async findLatestOfflineForCourse(
    applicationCourseId: string,
    studentId: string,
  ) {
    return prisma.transaction.findFirst({
      where: {
        studentId,
        paymentMethod: { in: ["demand_draft", "bank_transfer"] },
        ledgerEntry: { feeCategory: "token_fee", applicationCourseId },
      },
      orderBy: { createdAt: "desc" },
      select: OFFLINE_TRANSACTION_SELECT,
    });
  }

  static async findAnyPendingForCourse(applicationCourseId: string) {
    return prisma.transaction.findFirst({
      where: {
        status: "pending",
        ledgerEntry: { feeCategory: "token_fee", applicationCourseId },
      },
      select: { id: true, paymentMethod: true },
    });
  }

  static async countPendingOfflineReview(collegeId: string) {
    return prisma.transaction.count({
      where: {
        collegeId,
        paymentMethod: { in: ["demand_draft", "bank_transfer"] },
        verificationStatus: "pending_verification",
      },
    });
  }

  static async listOfflineForCollege(
    collegeId: string,
    filters: { verificationStatus?: string; page: number; limit: number },
  ) {
    const where = {
      collegeId,
      paymentMethod: { in: ["demand_draft", "bank_transfer"] as string[] },
      ...(filters.verificationStatus
        ? { verificationStatus: filters.verificationStatus }
        : {}),
    };
    const [rows, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        select: {
          ...OFFLINE_TRANSACTION_SELECT,
          ledgerEntry: {
            select: {
              id: true,
              applicationCourseId: true,
              feeCategory: true,
              applicationCourse: {
                select: {
                  id: true,
                  course: { select: { id: true, name: true } },
                  application: {
                    select: {
                      id: true,
                      student: {
                        select: { id: true, fullName: true, email: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.transaction.count({ where }),
    ]);
    return { rows, total };
  }

  static async markVerified(
    tx: Prisma.TransactionClient,
    id: string,
    staffId: string,
    receivedAmount: number,
  ) {
    return tx.transaction.update({
      where: { id },
      data: {
        status: "completed",
        verificationStatus: "verified",
        amount: receivedAmount,
        paidAt: new Date(),
        verifiedBy: staffId,
        verifiedAt: new Date(),
      },
      select: OFFLINE_TRANSACTION_SELECT,
    });
  }

  static async markRejected(id: string, staffId: string, note: string) {
    return prisma.transaction.update({
      where: { id },
      data: {
        status: "rejected",
        verificationStatus: "rejected",
        rejectionReason: note,
        verifiedBy: staffId,
        verifiedAt: new Date(),
      },
      select: OFFLINE_TRANSACTION_SELECT,
    });
  }
}
