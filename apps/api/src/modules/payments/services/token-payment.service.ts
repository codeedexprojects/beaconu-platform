import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { TokenPaymentRepository } from "../repositories/token-payment.repository";
import { getPaymentProvider } from "../lib/get-payment-provider";
import { notifyPaymentConfirmed } from "../lib/notify-payment";
import { enqueueInvoiceGeneration } from "../jobs/invoice-generation.job";
import type { ConfirmPaymentInput } from "../validators/application-payment.validator";
import type {
  SubmitOfflineTokenPaymentInput,
  ResubmitOfflineTokenPaymentInput,
  ReviewOfflineTokenPaymentInput,
} from "../validators/token-payment.validator";

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

function toOfflineDto(row: {
  id: string;
  transactionNumber: string;
  amount: unknown;
  currency: string;
  status: string;
  paymentMethod: string;
  uploadProofUrl: string | null;
  uploadProofFileName: string | null;
  ddNumber: string | null;
  ddBankName: string | null;
  ddDate: Date | null;
  bankRefNumber: string | null;
  studentNote: string | null;
  verificationStatus: string;
  verifiedBy: string | null;
  verifiedAt: Date | null;
  rejectionReason: string | null;
  paidAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: row.id,
    transactionNumber: row.transactionNumber,
    amount: (row.amount as { toString(): string }).toString(),
    currency: row.currency,
    status: row.status,
    paymentMethod: row.paymentMethod,
    proofUrl: row.uploadProofUrl,
    proofFileName: row.uploadProofFileName,
    ddNumber: row.ddNumber,
    ddBankName: row.ddBankName,
    ddDate: row.ddDate?.toISOString() ?? null,
    bankRefNumber: row.bankRefNumber,
    studentNote: row.studentNote,
    verificationStatus: row.verificationStatus,
    verifiedBy: row.verifiedBy,
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
    rejectionReason: row.rejectionReason,
    isResubmission:
      row.verificationStatus !== "rejected" && !!row.rejectionReason,
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
    if (!course.application.admissionCycle.tokenOnlinePaymentEnabled) {
      throw new ConflictError(
        "Online payment is not available for this admission cycle",
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
    await enqueueInvoiceGeneration(finalized.id);

    return toDto(finalized);
  }

  static async submitOffline(
    applicationCourseId: string,
    studentId: string,
    data: SubmitOfflineTokenPaymentInput,
  ) {
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
    if (!course.application.admissionCycle.tokenOfflinePaymentEnabled) {
      throw new ConflictError(
        "Offline payment is not available for this admission cycle",
      );
    }

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
    if (data.amount !== totalAmount) {
      throw new ConflictError(
        `The submitted amount must match the configured token amount of ${totalAmount}`,
      );
    }

    const pending =
      await TokenPaymentRepository.findAnyPendingForCourse(applicationCourseId);
    if (pending) {
      throw new ConflictError(
        "A payment submission for this course is already awaiting review",
      );
    }

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
    if (ledgerEntry.status === "paid") {
      throw new ConflictError(
        "The token for this course has already been paid",
      );
    }

    const created = await TokenPaymentRepository.createOfflineTransaction({
      studentId,
      collegeId: course.application.collegeId,
      ledgerEntryId: ledgerEntry.id,
      amount: data.amount,
      paymentMethod: data.payment_method,
      uploadProofUrl: data.proof_url,
      uploadProofFileName: data.proof_file_name,
      ddNumber: data.dd_number,
      ddBankName: data.dd_bank_name,
      ddDate: data.dd_date,
      bankRefNumber: data.bank_ref_number,
      studentNote: data.note,
    });
    const finalized = await TokenPaymentRepository.setTransactionNumber(
      created.id,
      buildTransactionNumber(created.id),
    );
    const offline = await TokenPaymentRepository.findOfflineById(finalized.id);

    return toOfflineDto(offline!);
  }

  static async resubmitOffline(
    transactionId: string,
    studentId: string,
    data: ResubmitOfflineTokenPaymentInput,
  ) {
    const transaction =
      await TokenPaymentRepository.findOfflineById(transactionId);
    if (!transaction || transaction.studentId !== studentId) {
      throw new NotFoundError("Transaction");
    }
    if (transaction.verificationStatus !== "rejected") {
      throw new ConflictError("Only a rejected submission can be resubmitted");
    }

    const applicationCourseId = transaction.ledgerEntry?.applicationCourseId;
    if (!applicationCourseId) throw new NotFoundError("Transaction");

    const course = await TokenPaymentRepository.findApplicationCourseForPayment(
      applicationCourseId,
      studentId,
    );
    if (!course) throw new NotFoundError("Application course");

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
    if (data.amount !== totalAmount) {
      throw new ConflictError(
        `The submitted amount must match the configured token amount of ${totalAmount}`,
      );
    }

    const updated = await TokenPaymentRepository.updateOfflineSubmission(
      transactionId,
      {
        amount: data.amount,
        paymentMethod: data.payment_method,
        uploadProofUrl: data.proof_url,
        uploadProofFileName: data.proof_file_name,
        ddNumber: data.dd_number,
        ddBankName: data.dd_bank_name,
        ddDate: data.dd_date,
        bankRefNumber: data.bank_ref_number,
        studentNote: data.note,
      },
    );

    return toOfflineDto(updated);
  }

  static async getOfflineStatus(
    applicationCourseId: string,
    studentId: string,
  ) {
    const latest = await TokenPaymentRepository.findLatestOfflineForCourse(
      applicationCourseId,
      studentId,
    );
    return latest ? toOfflineDto(latest) : null;
  }

  static async listOfflineForReview(
    collegeId: string,
    filters: { verificationStatus?: string; page: number; limit: number },
  ) {
    const { rows, total } = await TokenPaymentRepository.listOfflineForCollege(
      collegeId,
      filters,
    );
    return {
      data: rows.map((r) => ({
        ...toOfflineDto(r),
        applicationCourseId: r.ledgerEntry?.applicationCourseId ?? null,
        courseName: r.ledgerEntry?.applicationCourse?.course.name ?? null,
        studentName:
          r.ledgerEntry?.applicationCourse?.application.student.fullName ??
          null,
        studentEmail:
          r.ledgerEntry?.applicationCourse?.application.student.email ?? null,
      })),
      total,
    };
  }

  static async reviewOffline(
    transactionId: string,
    staffId: string,
    data: ReviewOfflineTokenPaymentInput,
  ) {
    const transaction =
      await TokenPaymentRepository.findOfflineById(transactionId);
    if (
      !transaction ||
      transaction.verificationStatus !== "pending_verification"
    ) {
      throw new NotFoundError("Transaction");
    }

    if (data.decision === "rejected") {
      const rejected = await TokenPaymentRepository.markRejected(
        transactionId,
        staffId,
        data.note!,
      );
      return { ...toOfflineDto(rejected), finalized: false as const };
    }

    const applicationCourseId = transaction.ledgerEntry?.applicationCourseId;
    if (!applicationCourseId) throw new NotFoundError("Transaction");

    const course = await TokenPaymentRepository.findApplicationCourseForPayment(
      applicationCourseId,
      transaction.studentId,
    );
    if (!course) throw new NotFoundError("Application course");

    const configured = await TokenPaymentRepository.findConfiguredTokenAmount(
      course.application.admissionCycleId,
      course.courseId,
    );
    const totalAmount = configured?.tokenAmount?.toNumber();
    if (totalAmount === undefined || data.received_amount !== totalAmount) {
      throw new ConflictError(
        `The received amount must exactly match the configured token amount${
          totalAmount !== undefined ? ` of ${totalAmount}` : ""
        }`,
      );
    }

    const finalized = await prisma.$transaction(async (tx) => {
      const verified = await TokenPaymentRepository.markVerified(
        tx,
        transactionId,
        staffId,
        data.received_amount!,
      );
      await TokenPaymentRepository.markLedgerPaid(
        tx,
        transaction.ledgerEntry!.id,
        data.received_amount!,
      );
      return verified;
    });

    return {
      ...toOfflineDto(finalized),
      finalized: true as const,
      applicationCourseId,
      studentId: transaction.studentId,
    };
  }
}
