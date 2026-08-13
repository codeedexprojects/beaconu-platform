import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { HostelPaymentRepository } from "../repositories/hostel-payment.repository";
import { getPaymentProvider } from "../lib/get-payment-provider";
import { HostelEnrollmentService } from "@/modules/hostel/services/hostel-enrollment.service";
import { notifyPaymentConfirmed } from "../lib/notify-payment";
import type { ConfirmPaymentInput } from "../validators/application-payment.validator";
import type { InitiateHostelTokenFeeInput } from "@beaconu/types";

function buildTransactionNumber(id: string) {
  const numericSuffix = (id.split("-").pop() ?? id).padStart(6, "0");
  return `HBK-${numericSuffix}`;
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

async function initiate(
  studentId: string,
  collegeId: string,
  roomTypeId: string,
  amount: number,
) {
  const pending = await HostelPaymentRepository.findPendingTransaction(
    studentId,
    roomTypeId,
  );
  if (pending) return toDto(pending);

  let ledgerEntry = await HostelPaymentRepository.findLedgerEntry(
    studentId,
    roomTypeId,
  );
  if (!ledgerEntry) {
    ledgerEntry = await HostelPaymentRepository.createLedgerEntry({
      studentId,
      collegeId,
      roomTypeId,
      amount,
    });
  }
  if (ledgerEntry.status === "paid") {
    throw new ConflictError("This fee has already been paid");
  }

  const provider = getPaymentProvider();
  const orderAmount = ledgerEntry.netAmount.toNumber();
  const order = await provider.createOrder({
    amount: orderAmount,
    currency: "INR",
    receipt: `${studentId}-${roomTypeId}-hostel-booking`,
    notes: { studentId, roomTypeId },
  });

  const created = await HostelPaymentRepository.createTransaction({
    studentId,
    collegeId,
    ledgerEntryId: ledgerEntry.id,
    amount: order.amount,
    currency: order.currency,
    paymentMethod: provider.name,
    razorpayOrderId: order.providerOrderId,
    gatewayResponse: order.raw,
  });
  const finalized = await HostelPaymentRepository.setTransactionNumber(
    created.id,
    buildTransactionNumber(created.id),
  );

  return toDto(finalized);
}

async function confirm(studentId: string, body: ConfirmPaymentInput) {
  const transaction = await HostelPaymentRepository.findById(
    body.transaction_id,
  );
  if (!transaction || transaction.studentId !== studentId) {
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
    await HostelPaymentRepository.markFailed(transaction.id);
    throw new ConflictError("Payment verification failed");
  }

  const finalized = await prisma.$transaction(async (tx) => {
    const paid = await HostelPaymentRepository.markPaid(
      tx,
      transaction.id,
      body.provider_payment_id,
    );
    await HostelPaymentRepository.markLedgerPaid(
      tx,
      transaction.ledgerEntryId!,
      paid.amount.toNumber(),
    );
    return paid;
  });

  await notifyPaymentConfirmed(
    studentId,
    "hostel fee",
    finalized.amount.toNumber(),
  );

  return toDto(finalized);
}

export class HostelPaymentService {
  static async initiateBooking(
    studentId: string,
    data: InitiateHostelTokenFeeInput,
  ) {
    const roomType = await HostelEnrollmentService.validateRoomTypeAccess(
      studentId,
      data.room_type_id,
    );
    await HostelEnrollmentService.assertNoActiveEnrollment(studentId);

    const amount =
      roomType.admissionFee.toNumber() + roomType.securityDeposit.toNumber();

    return initiate(
      studentId,
      roomType.hostel.collegeId,
      data.room_type_id,
      amount,
    );
  }

  static async confirmBooking(
    studentId: string,
    body: ConfirmPaymentInput & InitiateHostelTokenFeeInput,
  ) {
    const result = await confirm(studentId, body);
    await HostelEnrollmentService.createEnrollment(
      studentId,
      body.room_type_id,
      body,
    );
    return result;
  }

  static async listMine(
    studentId: string,
    pagination: { page: number; limit: number },
  ) {
    const { rows, total } = await HostelPaymentRepository.listForStudent(
      studentId,
      pagination,
    );
    return {
      data: rows.map((r) => {
        const txn = r.transactions[0];
        const roomTypeId = r.description?.split(" — ")[1] ?? null;
        return {
          id: r.id,
          transactionNumber: txn?.transactionNumber ?? "",
          feeCategory: r.feeCategory,
          roomTypeId,
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
