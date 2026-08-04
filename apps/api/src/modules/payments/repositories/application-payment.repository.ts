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

export class ApplicationPaymentRepository {
  static async findApplicationForPayment(
    applicationId: string,
    studentId: string,
  ) {
    return prisma.application.findFirst({
      where: { id: applicationId, studentId },
      select: {
        id: true,
        collegeId: true,
        feePaymentStatus: true,
        totalApplicationFee: true,
      },
    });
  }

  static async findPendingTransaction(applicationId: string) {
    return prisma.transaction.findFirst({
      where: {
        status: "pending",
        ledgerEntry: { applicationCourse: { applicationId } },
      },
      select: TRANSACTION_SELECT,
    });
  }

  static async findLedgerEntry(applicationId: string) {
    return prisma.studentFeeLedger.findFirst({
      where: {
        feeCategory: "application_fee",
        applicationCourse: { applicationId, isPrimary: true },
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

  static async findPrimaryApplicationCourse(applicationId: string) {
    return prisma.applicationCourse.findFirst({
      where: { applicationId, isPrimary: true },
      select: { id: true, applicationFee: true },
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
        feeCategory: "application_fee",
        description: "Application fee",
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

  static async updateLedgerAmount(ledgerEntryId: string, amount: number) {
    return prisma.studentFeeLedger.update({
      where: { id: ledgerEntryId },
      data: { totalAmount: amount, netAmount: amount, balanceAmount: amount },
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
          select: {
            id: true,
            applicationCourse: { select: { applicationId: true } },
          },
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
}
