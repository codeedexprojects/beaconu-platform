import { prisma } from "@beaconu/db";
import { EnrollmentService } from "@/modules/admissions/services/enrollment.service";
import { normalizeAcademicYear } from "../lib/academic-year";

function toNumber(value: { toNumber(): number } | null | undefined): number {
  return value ? value.toNumber() : 0;
}

function isSemesterRow(row: {
  feeCategory: string;
  yearOrSemester: string | null;
}) {
  return (
    row.yearOrSemester !== "One-time" &&
    (row.feeCategory === "tuition_fee" ||
      row.yearOrSemester?.startsWith("Year") ||
      row.yearOrSemester?.startsWith("Semester"))
  );
}

export class CourseFeeSummaryQuery {
  static async getSummary(studentId: string, collegeId: string) {
    const { oneTime, currentDue, additional } =
      await CourseFeeSummaryQuery.listCourseFees(studentId, collegeId);

    let totalFee = 0;
    let paidAmount = 0;

    for (const row of [...oneTime, ...additional]) {
      const amount = Number(row.amount);
      totalFee += amount;
      if (row.status === "paid") paidAmount += amount;
    }
    for (const group of currentDue) {
      totalFee += Number(group.totalPayable);
      paidAmount += Number(group.paidAmount);
    }

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
        description: true,
        dueDate: true,
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
        description: true,
        status: true,
        transactions: {
          where: { status: "completed" },
          select: { id: true, paidAt: true },
          orderBy: { paidAt: "desc" },
          take: 1,
        },
      },
    });

    // Bundled semester-group ledger entries are matched by description, not
    // feeStructureId (a single ledger row can cover several FeeStructure
    // rows at once — see CourseFeePaymentService.groupDescription). Both the
    // lump-sum row ("Semester 1 — Semester Fees") and each installment row
    // ("Semester 1 — Semester Fees — Installment 1 of 3") share this prefix.
    const groupLedgerRows = await prisma.studentFeeLedger.findMany({
      where: {
        studentId,
        collegeId,
        description: { contains: " — Semester Fees" },
      },
      select: {
        description: true,
        status: true,
        netAmount: true,
        paidAmount: true,
        transactions: {
          where: { status: "completed" },
          select: { id: true, paidAt: true },
          orderBy: { paidAt: "desc" },
          take: 1,
        },
      },
    });

    function singleRowStatus(feeStructureId: string) {
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

    function mapFlatRow(row: (typeof feeStructures)[number]) {
      return {
        feeStructureId: row.id,
        feeCategory: row.feeCategory,
        amount: row.amount.toString(),
        yearOrSemester: row.yearOrSemester,
        description: row.description,
        dueDate: row.dueDate ? row.dueDate.toISOString().slice(0, 10) : null,
        instalmentAllowed: row.instalmentAllowed,
        ...singleRowStatus(row.id),
      };
    }

    const oneTime = feeStructures
      .filter((f) => f.yearOrSemester === "One-time")
      .map(mapFlatRow);
    const additional = feeStructures
      .filter((f) => f.yearOrSemester !== "One-time" && !isSemesterRow(f))
      .map(mapFlatRow);

    const semesterRows = feeStructures.filter(isSemesterRow);
    const groups = new Map<string, typeof semesterRows>();
    for (const row of semesterRows) {
      const key = row.yearOrSemester ?? "Unspecified";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    }

    const currentDue = Array.from(groups.entries()).map(
      ([yearOrSemester, rows]) => {
        const totalPayable = rows.reduce(
          (sum, r) => sum + r.amount.toNumber(),
          0,
        );
        const dueDate = rows
          .map((r) => r.dueDate)
          .filter((d): d is Date => d !== null)
          .sort((a, b) => a.getTime() - b.getTime())[0];
        const instalmentAllowed = rows.some((r) => r.instalmentAllowed);

        const groupKey = `${yearOrSemester} — Semester Fees`;
        const groupRows = groupLedgerRows.filter(
          (g) =>
            g.description === groupKey ||
            g.description?.startsWith(`${groupKey} — Installment`),
        );
        const groupPaidAmount = groupRows.reduce(
          (sum, g) => sum + toNumber(g.paidAmount),
          0,
        );
        const status =
          groupRows.length > 0 && groupRows.every((g) => g.status === "paid")
            ? ("paid" as const)
            : groupRows.length > 0
              ? ("pending" as const)
              : ("not_started" as const);
        const latestTxn = groupRows
          .flatMap((g) => g.transactions)
          .sort(
            (a, b) => (b.paidAt?.getTime() ?? 0) - (a.paidAt?.getTime() ?? 0),
          )[0];

        return {
          yearOrSemester,
          dueDate: dueDate ? dueDate.toISOString().slice(0, 10) : null,
          totalPayable: totalPayable.toString(),
          paidAmount: groupPaidAmount.toString(),
          status,
          transactionId: latestTxn?.id ?? null,
          paidAt: latestTxn?.paidAt ? latestTxn.paidAt.toISOString() : null,
          instalmentAllowed,
          lineItems: rows.map((r) => ({
            feeStructureId: r.id,
            feeCategory: r.feeCategory,
            amount: r.amount.toString(),
            description: r.description,
          })),
        };
      },
    );

    return { oneTime, currentDue, additional };
  }
}
