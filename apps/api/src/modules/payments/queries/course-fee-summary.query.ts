import { prisma } from "@beaconu/db";
import { EnrollmentService } from "@/modules/admissions/services/enrollment.service";

function toNumber(value: { toNumber(): number } | null | undefined): number {
  return value ? value.toNumber() : 0;
}

function normalizeAcademicYear(value: string): string {
  const parts = value.match(/\d+/g) ?? [];
  if (parts.length === 0) return value.trim();
  const start = (parts[0] ?? "").slice(-4).padStart(4, "0");
  const end = parts[1] ? parts[1].slice(-2).padStart(2, "0") : "";
  return end ? `${start}-${end}` : start;
}

export class CourseFeeSummaryQuery {
  static async getSummary(studentId: string, collegeId: string) {
    const enrollment = await EnrollmentService.getActiveSummary(studentId);
    if (!enrollment || enrollment.collegeId !== collegeId) {
      return { totalFee: "0", paidAmount: "0", dueAmount: "0", percentPaid: 0 };
    }

    const enrollmentYear = normalizeAcademicYear(enrollment.academicYear);
    const allFeeStructures = await prisma.feeStructure.findMany({
      where: { courseId: enrollment.courseId, isActive: true },
      select: { id: true, amount: true, academicYear: true },
    });
    const feeStructures = allFeeStructures.filter(
      (row) => normalizeAcademicYear(row.academicYear) === enrollmentYear,
    );
    const totalFee = feeStructures.reduce(
      (sum, row) => sum + row.amount.toNumber(),
      0,
    );

    const paidLedgerRows = await prisma.studentFeeLedger.findMany({
      where: {
        studentId,
        status: "paid",
        feeStructureId: { in: feeStructures.map((f) => f.id) },
      },
      select: { paidAmount: true },
    });
    const paidAmount = paidLedgerRows.reduce(
      (sum, row) => sum + toNumber(row.paidAmount),
      0,
    );

    const dueAmount = Math.max(0, totalFee - paidAmount);
    const percentPaid =
      totalFee > 0 ? Math.round((paidAmount / totalFee) * 100) : 0;

    return {
      totalFee: totalFee.toString(),
      paidAmount: paidAmount.toString(),
      dueAmount: dueAmount.toString(),
      percentPaid,
    };
  }

  static async listCourseFees(studentId: string, collegeId: string) {
    const enrollment = await EnrollmentService.getActiveSummary(studentId);
    if (!enrollment || enrollment.collegeId !== collegeId) {
      return { oneTime: [], currentDue: [], additional: [] };
    }

    const enrollmentYear = normalizeAcademicYear(enrollment.academicYear);
    const allFeeStructures = await prisma.feeStructure.findMany({
      where: { courseId: enrollment.courseId, isActive: true },
      select: {
        id: true,
        feeCategory: true,
        amount: true,
        yearOrSemester: true,
        academicYear: true,
        instalmentAllowed: true,
      },
      orderBy: [{ yearOrSemester: "asc" }, { feeCategory: "asc" }],
    });
    const feeStructures = allFeeStructures.filter(
      (row) => normalizeAcademicYear(row.academicYear) === enrollmentYear,
    );

    const ledgerRows = await prisma.studentFeeLedger.findMany({
      where: {
        studentId,
        feeStructureId: { in: feeStructures.map((f) => f.id) },
      },
      select: {
        feeStructureId: true,
        status: true,
        description: true,
        transactions: {
          where: { status: "completed" },
          select: { id: true, paidAt: true },
          orderBy: { paidAt: "desc" },
          take: 1,
        },
      },
    });

    function statusFor(feeStructureId: string) {
      const rows = ledgerRows.filter(
        (r) => r.feeStructureId === feeStructureId,
      );
      if (rows.length === 0)
        return {
          status: "not_started" as const,
          transactionId: null,
          paidAt: null,
        };
      const allPaid = rows.every((r) => r.status === "paid");
      if (allPaid) {
        const txn = rows.flatMap((r) => r.transactions)[0];
        return {
          status: "paid" as const,
          transactionId: txn?.id ?? null,
          paidAt: txn?.paidAt ? txn.paidAt.toISOString() : null,
        };
      }
      return { status: "pending" as const, transactionId: null, paidAt: null };
    }

    function mapRow(row: (typeof feeStructures)[number]) {
      return {
        feeStructureId: row.id,
        feeCategory: row.feeCategory,
        amount: row.amount.toString(),
        yearOrSemester: row.yearOrSemester,
        instalmentAllowed: row.instalmentAllowed,
        ...statusFor(row.id),
      };
    }

    const oneTime = feeStructures
      .filter((f) => f.yearOrSemester === "One-time")
      .map(mapRow);
    const currentDue = feeStructures
      .filter(
        (f) =>
          f.feeCategory === "tuition_fee" ||
          f.yearOrSemester?.startsWith("Year") ||
          f.yearOrSemester?.startsWith("Semester"),
      )
      .filter((f) => f.yearOrSemester !== "One-time")
      .map(mapRow);
    const additional = feeStructures
      .filter(
        (f) =>
          f.yearOrSemester !== "One-time" &&
          !(
            f.feeCategory === "tuition_fee" ||
            f.yearOrSemester?.startsWith("Year") ||
            f.yearOrSemester?.startsWith("Semester")
          ),
      )
      .map(mapRow);

    return { oneTime, currentDue, additional };
  }
}
