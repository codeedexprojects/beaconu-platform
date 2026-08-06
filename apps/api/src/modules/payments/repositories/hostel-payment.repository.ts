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

function feeDescription(
  feeCategory: "hostel_application_fee" | "hostel_token_fee",
  roomTypeId: string,
): string {
  const label =
    feeCategory === "hostel_application_fee"
      ? "Hostel application fee"
      : "Hostel token fee";
  return `${label} — ${roomTypeId}`;
}

export class HostelPaymentRepository {
  static async findPendingTransaction(
    studentId: string,
    feeCategory: "hostel_application_fee" | "hostel_token_fee",
    roomTypeId: string,
  ) {
    return prisma.transaction.findFirst({
      where: {
        studentId,
        status: "pending",
        ledgerEntry: {
          feeCategory,
          description: feeDescription(feeCategory, roomTypeId),
        },
      },
      select: TRANSACTION_SELECT,
    });
  }

  static async findLedgerEntry(
    studentId: string,
    feeCategory: "hostel_application_fee" | "hostel_token_fee",
    roomTypeId: string,
  ) {
    return prisma.studentFeeLedger.findFirst({
      where: {
        studentId,
        feeCategory,
        description: feeDescription(feeCategory, roomTypeId),
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

  static async createLedgerEntry(data: {
    studentId: string;
    collegeId: string;
    feeCategory: "hostel_application_fee" | "hostel_token_fee";
    roomTypeId: string;
    amount: number;
  }) {
    return prisma.studentFeeLedger.create({
      data: {
        studentId: data.studentId,
        collegeId: data.collegeId,
        feeCategory: data.feeCategory,
        description: feeDescription(data.feeCategory, data.roomTypeId),
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
          select: { id: true, feeCategory: true, description: true },
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

  static async listForStudent(
    studentId: string,
    pagination: { page: number; limit: number },
  ) {
    const where = {
      studentId,
      feeCategory: { in: ["hostel_application_fee", "hostel_token_fee"] },
    };
    const [rows, total] = await prisma.$transaction([
      prisma.studentFeeLedger.findMany({
        where,
        select: {
          id: true,
          feeCategory: true,
          description: true,
          netAmount: true,
          status: true,
          createdAt: true,
          transactions: {
            select: TRANSACTION_SELECT,
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.studentFeeLedger.count({ where }),
    ]);
    return { rows, total };
  }
}
