import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { ApplicationPaymentRepository } from "../repositories/application-payment.repository";
import { getPaymentProvider } from "../lib/get-payment-provider";
import type { ConfirmPaymentInput } from "../validators/application-payment.validator";

function buildTransactionNumber(id: string) {
  const numericSuffix = (id.split("-").pop() ?? id).padStart(6, "0");
  return `PAY-${numericSuffix}`;
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

export class ApplicationPaymentService {
  static async initiate(applicationId: string, studentId: string) {
    const application =
      await ApplicationPaymentRepository.findApplicationForPayment(
        applicationId,
        studentId,
      );
    if (!application) throw new NotFoundError("Application");
    if (application.feePaymentStatus === "paid") {
      throw new ConflictError(
        "This application's primary course fee has already been paid",
      );
    }

    // Created lazily on first initiate — keeps this module decoupled from
    // admissions' Start Application flow (see repository doc comment).
    let ledgerEntry =
      await ApplicationPaymentRepository.findPrimaryLedgerEntry(applicationId);
    if (!ledgerEntry) {
      const primaryCourse =
        await ApplicationPaymentRepository.findPrimaryApplicationCourse(
          applicationId,
        );
      if (!primaryCourse) throw new NotFoundError("Primary course");
      ledgerEntry = await ApplicationPaymentRepository.createLedgerEntry({
        studentId,
        collegeId: application.collegeId,
        applicationCourseId: primaryCourse.id,
        amount: primaryCourse.applicationFee.toNumber(),
      });
    }

    const provider = getPaymentProvider();
    const amount = ledgerEntry.netAmount.toNumber();
    const order = await provider.createOrder({
      amount,
      currency: "INR",
      receipt: applicationId,
      notes: { applicationId, studentId },
    });

    const created = await ApplicationPaymentRepository.createTransaction({
      studentId,
      collegeId: application.collegeId,
      ledgerEntryId: ledgerEntry.id,
      amount: order.amount,
      currency: order.currency,
      paymentMethod: provider.name,
      razorpayOrderId: order.providerOrderId,
      gatewayResponse: order.raw,
    });
    const finalized = await ApplicationPaymentRepository.setTransactionNumber(
      created.id,
      buildTransactionNumber(created.id),
    );

    return toDto(finalized);
  }

  static async confirm(
    applicationId: string,
    studentId: string,
    body: ConfirmPaymentInput,
  ) {
    const application =
      await ApplicationPaymentRepository.findApplicationForPayment(
        applicationId,
        studentId,
      );
    if (!application) throw new NotFoundError("Application");

    const transaction = await ApplicationPaymentRepository.findById(
      body.transaction_id,
    );
    if (
      !transaction ||
      transaction.ledgerEntry?.applicationCourse?.applicationId !==
        applicationId
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
      await ApplicationPaymentRepository.markFailed(transaction.id);
      throw new ConflictError("Payment verification failed");
    }

    const finalized = await prisma.$transaction(async (tx) => {
      const paid = await ApplicationPaymentRepository.markPaid(
        tx,
        transaction.id,
        body.provider_payment_id,
      );
      await ApplicationPaymentRepository.markLedgerPaid(
        tx,
        transaction.ledgerEntryId!,
        paid.amount.toNumber(),
      );
      return paid;
    });

    return toDto(finalized);
  }
}
