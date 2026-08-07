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

const LEDGER_SELECT = {
  id: true,
  feeStructureId: true,
  feeCategory: true,
  description: true,
  netAmount: true,
  paidAmount: true,
  balanceAmount: true,
  dueDate: true,
  status: true,
  createdAt: true,
} as const;

export class CourseFeePaymentRepository {
  static async findFeeStructure(feeStructureId: string) {
    return prisma.feeStructure.findFirst({
      where: { id: feeStructureId, isActive: true },
      select: {
        id: true,
        courseId: true,
        collegeId: true,
        amount: true,
        feeCategory: true,
        yearOrSemester: true,
        instalmentAllowed: true,
        instalmentConfig: true,
      },
    });
  }

  static async findPendingTransactionForLedgerEntry(ledgerEntryId: string) {
    return prisma.transaction.findFirst({
      where: { status: "pending", ledgerEntryId },
      select: TRANSACTION_SELECT,
    });
  }

  static async findLedgerEntryForFeeStructure(
    studentId: string,
    feeStructureId: string,
  ) {
    return prisma.studentFeeLedger.findFirst({
      where: {
        studentId,
        feeStructureId,
        description: { not: { contains: "Installment" } },
      },
      select: LEDGER_SELECT,
    });
  }

  static async createLedgerEntry(data: {
    studentId: string;
    collegeId: string;
    feeStructureId: string;
    feeCategory: string;
    description: string;
    amount: number;
    dueDate?: Date | null;
  }) {
    return prisma.studentFeeLedger.create({
      data: {
        studentId: data.studentId,
        collegeId: data.collegeId,
        feeStructureId: data.feeStructureId,
        feeCategory: data.feeCategory,
        description: data.description,
        totalAmount: data.amount,
        netAmount: data.amount,
        balanceAmount: data.amount,
        dueDate: data.dueDate ?? null,
      },
      select: LEDGER_SELECT,
    });
  }

  static async findInstallmentLedgerEntries(
    studentId: string,
    feeStructureId: string,
  ) {
    return prisma.studentFeeLedger.findMany({
      where: {
        studentId,
        feeStructureId,
        description: { contains: "Installment" },
      },
      select: LEDGER_SELECT,
      orderBy: { dueDate: "asc" },
    });
  }

  static async createInstallmentLedgerEntries(
    rows: {
      studentId: string;
      collegeId: string;
      feeStructureId: string;
      feeCategory: string;
      description: string;
      amount: number;
      dueDate: Date | null;
    }[],
  ) {
    await prisma.studentFeeLedger.createMany({
      data: rows.map((r) => ({
        studentId: r.studentId,
        collegeId: r.collegeId,
        feeStructureId: r.feeStructureId,
        feeCategory: r.feeCategory,
        description: r.description,
        totalAmount: r.amount,
        netAmount: r.amount,
        balanceAmount: r.amount,
        dueDate: r.dueDate,
      })),
    });
    return CourseFeePaymentRepository.findInstallmentLedgerEntries(
      rows[0].studentId,
      rows[0].feeStructureId,
    );
  }

  static async findLedgerEntryById(ledgerEntryId: string, studentId: string) {
    return prisma.studentFeeLedger.findFirst({
      where: { id: ledgerEntryId, studentId },
      select: { ...LEDGER_SELECT, collegeId: true },
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
        ledgerEntry: { select: { id: true, feeStructureId: true } },
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
}
