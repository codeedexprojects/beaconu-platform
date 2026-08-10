import { prisma } from "@beaconu/db";
import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { EnrollmentService } from "@/modules/admissions/services/enrollment.service";
import { CourseFeePaymentRepository } from "../repositories/course-fee-payment.repository";
import { getPaymentProvider } from "../lib/get-payment-provider";
import { normalizeAcademicYear } from "../lib/academic-year";
import type { ConfirmPaymentInput } from "../validators/application-payment.validator";

function buildTransactionNumber(id: string) {
  const numericSuffix = (id.split("-").pop() ?? id).padStart(6, "0");
  return `CFE-${numericSuffix}`;
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

function toInstallmentDto(row: {
  id: string;
  description: string | null;
  netAmount: { toString(): string };
  dueDate: Date | null;
  status: string;
}) {
  return {
    ledgerEntryId: row.id,
    description: row.description,
    amount: row.netAmount.toString(),
    dueDate: row.dueDate ? row.dueDate.toISOString().slice(0, 10) : null,
    status: row.status,
  };
}

async function assertEnrolled(studentId: string, collegeId: string) {
  const hasEnrollment = await EnrollmentService.hasEnrollmentAtCollege(
    studentId,
    collegeId,
  );
  if (!hasEnrollment) {
    throw new ForbiddenError("You are not enrolled at this college");
  }
}

async function createOrder(
  studentId: string,
  collegeId: string,
  ledgerEntry: {
    id: string;
    netAmount: { toNumber(): number };
    status: string;
  },
) {
  if (ledgerEntry.status === "paid") {
    throw new ConflictError("This fee has already been paid");
  }

  const pending =
    await CourseFeePaymentRepository.findPendingTransactionForLedgerEntry(
      ledgerEntry.id,
    );
  if (pending) return toDto(pending);

  const provider = getPaymentProvider();
  const amount = ledgerEntry.netAmount.toNumber();
  const order = await provider.createOrder({
    amount,
    currency: "INR",
    receipt: `${studentId}-${ledgerEntry.id}`,
    notes: { studentId, ledgerEntryId: ledgerEntry.id },
  });

  const created = await CourseFeePaymentRepository.createTransaction({
    studentId,
    collegeId,
    ledgerEntryId: ledgerEntry.id,
    amount: order.amount,
    currency: order.currency,
    paymentMethod: provider.name,
    razorpayOrderId: order.providerOrderId,
    gatewayResponse: order.raw,
  });
  const finalized = await CourseFeePaymentRepository.setTransactionNumber(
    created.id,
    buildTransactionNumber(created.id),
  );

  return toDto(finalized);
}

async function confirm(studentId: string, body: ConfirmPaymentInput) {
  const transaction = await CourseFeePaymentRepository.findById(
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
    await CourseFeePaymentRepository.markFailed(transaction.id);
    throw new ConflictError("Payment verification failed");
  }

  const finalized = await prisma.$transaction(async (tx) => {
    const paid = await CourseFeePaymentRepository.markPaid(
      tx,
      transaction.id,
      body.provider_payment_id,
    );
    await CourseFeePaymentRepository.markLedgerPaid(
      tx,
      transaction.ledgerEntryId!,
      paid.amount.toNumber(),
    );
    return paid;
  });

  return toDto(finalized);
}

async function resolveGroup(
  studentId: string,
  collegeId: string,
  yearOrSemester: string,
) {
  const enrollment = await EnrollmentService.getActiveSummary(studentId);
  if (!enrollment || enrollment.collegeId !== collegeId) {
    throw new ForbiddenError("You are not enrolled at this college");
  }

  const enrollmentYear = normalizeAcademicYear(enrollment.academicYear);
  const allRows =
    await CourseFeePaymentRepository.findFeeStructuresForCourseGroup(
      enrollment.courseId,
      yearOrSemester,
    );
  const rows = allRows.filter(
    (row) => normalizeAcademicYear(row.academicYear) === enrollmentYear,
  );
  if (rows.length === 0) {
    throw new NotFoundError("No fees found for this year/semester");
  }

  const anchor =
    rows.find((r) => r.instalmentAllowed) ??
    rows.find((r) => r.feeCategory === "tuition_fee") ??
    rows[0];
  const totalPayable = rows.reduce((sum, r) => sum + r.amount.toNumber(), 0);
  const groupKey = `${yearOrSemester} — Semester Fees`;

  return { collegeId: rows[0].collegeId, rows, anchor, totalPayable, groupKey };
}

export class CourseFeePaymentService {
  static async initiateSemesterFull(
    studentId: string,
    collegeId: string,
    yearOrSemester: string,
  ) {
    const { anchor, totalPayable, groupKey } = await resolveGroup(
      studentId,
      collegeId,
      yearOrSemester,
    );

    let ledgerEntry =
      await CourseFeePaymentRepository.findLedgerEntryForFeeStructure(
        studentId,
        anchor.id,
      );
    if (!ledgerEntry) {
      ledgerEntry = await CourseFeePaymentRepository.createLedgerEntry({
        studentId,
        collegeId,
        feeStructureId: anchor.id,
        feeCategory: "semester_fees",
        description: groupKey,
        amount: totalPayable,
      });
    }

    return createOrder(studentId, collegeId, ledgerEntry);
  }

  static async confirmSemesterFull(
    studentId: string,
    body: ConfirmPaymentInput,
  ) {
    return confirm(studentId, body);
  }

  static async setupSemesterInstallmentPlan(
    studentId: string,
    collegeId: string,
    yearOrSemester: string,
  ) {
    const { rows, anchor, totalPayable, groupKey } = await resolveGroup(
      studentId,
      collegeId,
      yearOrSemester,
    );

    if (!rows.some((r) => r.instalmentAllowed)) {
      throw new ConflictError(
        "Installment payment is not available for this semester",
      );
    }

    const existing =
      await CourseFeePaymentRepository.findInstallmentLedgerEntries(
        studentId,
        anchor.id,
      );
    if (existing.length > 0) return existing.map(toInstallmentDto);

    const config = anchor.instalmentConfig as {
      instalments?: { label: string; amount: number; dueDate?: string }[];
    } | null;
    const instalments = config?.instalments ?? [];
    if (instalments.length === 0) {
      throw new ConflictError(
        "No installment schedule is configured for this semester",
      );
    }

    const instalmentSum = instalments.reduce((sum, i) => sum + i.amount, 0);
    if (Math.abs(instalmentSum - totalPayable) > 0.01) {
      throw new ConflictError(
        `Installment amounts (${instalmentSum}) must sum to the semester total (${totalPayable}) — ask college-admin to fix the installment schedule`,
      );
    }

    const created =
      await CourseFeePaymentRepository.createInstallmentLedgerEntries(
        instalments.map((inst, idx) => ({
          studentId,
          collegeId,
          feeStructureId: anchor.id,
          feeCategory: "semester_fees",
          description: `${groupKey} — Installment ${idx + 1} of ${instalments.length}`,
          amount: inst.amount,
          dueDate: inst.dueDate ? new Date(inst.dueDate) : null,
        })),
      );

    return created.map(toInstallmentDto);
  }

  static async listSemesterInstallments(
    studentId: string,
    collegeId: string,
    yearOrSemester: string,
  ) {
    const { anchor } = await resolveGroup(studentId, collegeId, yearOrSemester);
    const rows = await CourseFeePaymentRepository.findInstallmentLedgerEntries(
      studentId,
      anchor.id,
    );
    const firstUnpaidIndex = rows.findIndex((r) => r.status !== "paid");
    return rows.map((row, idx) => ({
      ...toInstallmentDto(row),
      status:
        row.status === "paid"
          ? "paid"
          : idx === firstUnpaidIndex
            ? "due_now"
            : "upcoming",
    }));
  }

  static async initiateFull(studentId: string, feeStructureId: string) {
    const feeStructure =
      await CourseFeePaymentRepository.findFeeStructure(feeStructureId);
    if (!feeStructure) throw new NotFoundError("Fee structure not found");
    await assertEnrolled(studentId, feeStructure.collegeId);

    let ledgerEntry =
      await CourseFeePaymentRepository.findLedgerEntryForFeeStructure(
        studentId,
        feeStructureId,
      );
    if (!ledgerEntry) {
      ledgerEntry = await CourseFeePaymentRepository.createLedgerEntry({
        studentId,
        collegeId: feeStructure.collegeId,
        feeStructureId,
        feeCategory: feeStructure.feeCategory,
        description: `${feeStructure.feeCategory}${feeStructure.yearOrSemester ? ` — ${feeStructure.yearOrSemester}` : ""}`,
        amount: feeStructure.amount.toNumber(),
      });
    }

    return createOrder(studentId, feeStructure.collegeId, ledgerEntry);
  }

  static async confirmFull(studentId: string, body: ConfirmPaymentInput) {
    return confirm(studentId, body);
  }

  static async setupInstallmentPlan(studentId: string, feeStructureId: string) {
    const feeStructure =
      await CourseFeePaymentRepository.findFeeStructure(feeStructureId);
    if (!feeStructure) throw new NotFoundError("Fee structure not found");
    await assertEnrolled(studentId, feeStructure.collegeId);

    if (!feeStructure.instalmentAllowed) {
      throw new ConflictError(
        "Installment payment is not available for this fee",
      );
    }

    const existing =
      await CourseFeePaymentRepository.findInstallmentLedgerEntries(
        studentId,
        feeStructureId,
      );
    if (existing.length > 0) return existing.map(toInstallmentDto);

    const config = feeStructure.instalmentConfig as {
      instalments?: { label: string; amount: number; dueDate?: string }[];
    } | null;
    const instalments = config?.instalments ?? [];
    if (instalments.length === 0) {
      throw new ConflictError(
        "No installment schedule is configured for this fee",
      );
    }

    const created =
      await CourseFeePaymentRepository.createInstallmentLedgerEntries(
        instalments.map((inst, idx) => ({
          studentId,
          collegeId: feeStructure.collegeId,
          feeStructureId,
          feeCategory: feeStructure.feeCategory,
          description: `${inst.label} — Installment ${idx + 1} of ${instalments.length}`,
          amount: inst.amount,
          dueDate: inst.dueDate ? new Date(inst.dueDate) : null,
        })),
      );

    return created.map(toInstallmentDto);
  }

  static async listInstallments(studentId: string, feeStructureId: string) {
    const rows = await CourseFeePaymentRepository.findInstallmentLedgerEntries(
      studentId,
      feeStructureId,
    );
    const firstUnpaidIndex = rows.findIndex((r) => r.status !== "paid");
    return rows.map((row, idx) => ({
      ...toInstallmentDto(row),
      status:
        row.status === "paid"
          ? "paid"
          : idx === firstUnpaidIndex
            ? "due_now"
            : "upcoming",
    }));
  }

  static async initiateInstallment(studentId: string, ledgerEntryId: string) {
    const ledgerEntry = await CourseFeePaymentRepository.findLedgerEntryById(
      ledgerEntryId,
      studentId,
    );
    if (!ledgerEntry) throw new NotFoundError("Installment not found");
    await assertEnrolled(studentId, ledgerEntry.collegeId);

    return createOrder(studentId, ledgerEntry.collegeId, {
      id: ledgerEntry.id,
      netAmount: ledgerEntry.netAmount,
      status: ledgerEntry.status,
    });
  }

  static async confirmInstallment(
    studentId: string,
    body: ConfirmPaymentInput,
  ) {
    return confirm(studentId, body);
  }
}
