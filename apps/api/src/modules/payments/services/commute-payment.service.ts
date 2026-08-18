import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { CommutePaymentRepository } from "../repositories/commute-payment.repository";
import { getPaymentProvider } from "../lib/get-payment-provider";
import { CommuteRepository } from "@/modules/commute/repositories/commute.repository";
import { notifyPaymentConfirmed } from "../lib/notify-payment";
import { enqueueInvoiceGeneration } from "../jobs/invoice-generation.job";
import type { ConfirmPaymentInput } from "../validators/application-payment.validator";

function buildTransactionNumber(id: string) {
  const numericSuffix = (id.split("-").pop() ?? id).padStart(6, "0");
  return `CMF-${numericSuffix}`;
}

function currentPeriod(): string {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${now.getUTCFullYear()}-${month}`;
}

function toDto(row: {
  id: string;
  transactionNumber: string;
  amount: unknown;
  currency: string;
  status: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  paidAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: row.id,
    transactionId: row.id,
    transactionNumber: row.transactionNumber,
    amount: (row.amount as { toString(): string }).toString(),
    currency: row.currency,
    status: row.status,
    providerOrderId: row.razorpayOrderId,
    providerPaymentId: row.razorpayPaymentId,
    paidAt: row.paidAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export class CommutePaymentService {
  static async getCurrentPeriodStatus(
    studentId: string,
    collegeId: string,
    monthlyFee: string,
  ) {
    const period = currentPeriod();
    const ledgerEntry = await CommutePaymentRepository.findLedgerEntry(
      studentId,
      period,
    );
    return {
      period,
      amount: ledgerEntry ? ledgerEntry.netAmount.toString() : monthlyFee,
      status: ledgerEntry
        ? (ledgerEntry.status as "unpaid" | "pending" | "paid")
        : ("unpaid" as const),
    };
  }

  static async initiate(studentId: string, collegeId: string) {
    const enrollment = await CommuteRepository.findActiveEnrollment(studentId);
    if (!enrollment) {
      throw new ConflictError("Set up commute before paying");
    }

    const period = currentPeriod();
    const pending = await CommutePaymentRepository.findPendingTransaction(
      studentId,
      period,
    );
    if (pending) return toDto(pending);

    let ledgerEntry = await CommutePaymentRepository.findLedgerEntry(
      studentId,
      period,
    );
    if (!ledgerEntry) {
      ledgerEntry = await CommutePaymentRepository.createLedgerEntry({
        studentId,
        collegeId,
        period,
        amount: enrollment.bus.monthlyFee.toNumber(),
      });
    }
    if (ledgerEntry.status === "paid") {
      throw new ConflictError("This month's commute fee is already paid");
    }

    const provider = getPaymentProvider();
    const amount = ledgerEntry.netAmount.toNumber();
    const order = await provider.createOrder({
      amount,
      currency: "INR",
      receipt: `${studentId}-${period}`,
      notes: { studentId, period },
    });

    const created = await CommutePaymentRepository.createTransaction({
      studentId,
      collegeId,
      ledgerEntryId: ledgerEntry.id,
      amount: order.amount,
      currency: order.currency,
      paymentMethod: provider.name,
      razorpayOrderId: order.providerOrderId,
      gatewayResponse: order.raw,
    });
    const finalized = await CommutePaymentRepository.setTransactionNumber(
      created.id,
      buildTransactionNumber(created.id),
    );

    return toDto(finalized);
  }

  static async confirm(studentId: string, body: ConfirmPaymentInput) {
    const transaction = await CommutePaymentRepository.findById(
      body.transaction_id,
    );
    if (
      !transaction ||
      transaction.studentId !== studentId ||
      transaction.ledgerEntry?.feeCategory !== "commute_fee"
    ) {
      throw new NotFoundError("Transaction");
    }
    if (transaction.status === "completed") {
      return toDto(transaction);
    }

    const provider = getPaymentProvider();
    const verified = await provider.verifyPayment({
      providerOrderId: transaction.razorpayOrderId ?? "",
      providerPaymentId: body.provider_payment_id,
      signature: body.provider_signature,
    });
    if (!verified) {
      await CommutePaymentRepository.markFailed(transaction.id);
      throw new ConflictError("Payment verification failed");
    }

    const finalized = await prisma.$transaction(async (tx) => {
      const paid = await CommutePaymentRepository.markPaid(
        tx,
        transaction.id,
        body.provider_payment_id,
      );
      await CommutePaymentRepository.markLedgerPaid(
        tx,
        transaction.ledgerEntryId!,
        paid.amount.toNumber(),
      );
      return paid;
    });

    await notifyPaymentConfirmed(
      studentId,
      "commute fee",
      finalized.amount.toNumber(),
    );
    await enqueueInvoiceGeneration(finalized.id);

    return toDto(finalized);
  }

  static async listMine(
    studentId: string,
    pagination: { page: number; limit: number },
  ) {
    const { rows, total } = await CommutePaymentRepository.listForStudent(
      studentId,
      pagination,
    );
    return {
      data: rows.map((r) => {
        const txn = r.transactions[0];
        return {
          id: r.id,
          transactionId: txn?.id ?? null,
          transactionNumber: txn?.transactionNumber ?? "",
          period: r.description?.replace("Commute fee — ", "") ?? "",
          amount: r.netAmount.toString(),
          status: r.status,
          paidAt: txn?.paidAt ? txn.paidAt.toISOString() : null,
          createdAt: r.createdAt.toISOString(),
        };
      }),
      total,
    };
  }
}
