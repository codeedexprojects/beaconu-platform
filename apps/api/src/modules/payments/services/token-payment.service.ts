import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { TokenPaymentRepository } from "../repositories/token-payment.repository";
import { getPaymentProvider } from "../lib/get-payment-provider";
import { notifyPaymentConfirmed } from "../lib/notify-payment";
import type { ConfirmPaymentInput } from "../validators/application-payment.validator";

function buildTransactionNumber(id: string) {
  const numericSuffix = (id.split("-").pop() ?? id).padStart(6, "0");
  return `TOK-${numericSuffix}`;
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

export class TokenPaymentService {
  static async initiate(applicationCourseId: string, studentId: string) {
    const course = await TokenPaymentRepository.findApplicationCourseForPayment(
      applicationCourseId,
      studentId,
    );
    if (!course) throw new NotFoundError("Application course");
    if (course.status === "token_paid") {
      throw new ConflictError(
        "The token for this course has already been paid",
      );
    }
    if (course.status !== "shortlisted") {
      throw new ConflictError(
        "This course must be shortlisted before the token can be paid",
      );
    }

    const pending =
      await TokenPaymentRepository.findPendingTransaction(applicationCourseId);
    if (pending) return toDto(pending);

    const configured = await TokenPaymentRepository.findConfiguredTokenAmount(
      course.application.admissionCycleId,
      course.courseId,
    );
    if (!configured?.tokenAmount) {
      throw new ConflictError(
        "A token amount has not been configured for this course yet",
      );
    }
    const totalAmount = configured.tokenAmount.toNumber();

    let ledgerEntry =
      await TokenPaymentRepository.findLedgerEntry(applicationCourseId);
    if (!ledgerEntry) {
      ledgerEntry = await TokenPaymentRepository.createLedgerEntry({
        studentId,
        collegeId: course.application.collegeId,
        applicationCourseId,
        amount: totalAmount,
      });
    }

    const provider = getPaymentProvider();
    const amount = ledgerEntry.netAmount.toNumber();
    const order = await provider.createOrder({
      amount,
      currency: "INR",
      receipt: applicationCourseId,
      notes: { applicationCourseId, studentId },
    });

    const created = await TokenPaymentRepository.createTransaction({
      studentId,
      collegeId: course.application.collegeId,
      ledgerEntryId: ledgerEntry.id,
      amount: order.amount,
      currency: order.currency,
      paymentMethod: provider.name,
      razorpayOrderId: order.providerOrderId,
      gatewayResponse: order.raw,
    });
    const finalized = await TokenPaymentRepository.setTransactionNumber(
      created.id,
      buildTransactionNumber(created.id),
    );

    return toDto(finalized);
  }

  static async confirm(
    applicationCourseId: string,
    studentId: string,
    body: ConfirmPaymentInput,
  ) {
    const course = await TokenPaymentRepository.findApplicationCourseForPayment(
      applicationCourseId,
      studentId,
    );
    if (!course) throw new NotFoundError("Application course");

    const transaction = await TokenPaymentRepository.findById(
      body.transaction_id,
    );
    if (
      !transaction ||
      transaction.ledgerEntry?.applicationCourseId !== applicationCourseId ||
      transaction.ledgerEntry?.feeCategory !== "token_fee"
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
      await TokenPaymentRepository.markFailed(transaction.id);
      throw new ConflictError("Payment verification failed");
    }

    const finalized = await prisma.$transaction(async (tx) => {
      const paid = await TokenPaymentRepository.markPaid(
        tx,
        transaction.id,
        body.provider_payment_id,
      );
      await TokenPaymentRepository.markLedgerPaid(
        tx,
        transaction.ledgerEntryId!,
        paid.amount.toNumber(),
      );
      return paid;
    });

    await notifyPaymentConfirmed(
      studentId,
      "token fee",
      finalized.amount.toNumber(),
    );

    return toDto(finalized);
  }
}
