import { prisma, Prisma } from "@beaconu/db";
import { PaginationHelper } from "@/shared/responses/pagination";
import {
  FinanceOverviewQueryInput,
  FinanceTransactionsExportQueryInput,
  FinanceTransactionsQueryInput,
} from "../validators/finance.validator";

const TUITION_FEE_CATEGORIES = ["tuition_fee", "semester_fees", "tution fee"];
const COMMUTE_FEE_CATEGORY = "commute_fee";
const HOUSING_FEE_CATEGORIES = ["hostel_booking_fee", "hostel_fee"];
const APPLICATION_FEE_CATEGORY = "application_fee";
const TOKEN_FEE_CATEGORY = "token_fee";

function roundToPaise(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Human labels for the only payment methods actually recorded today —
 * see root CLAUDE.md's payments module: online flows all go through the
 * mock/Razorpay provider (no real sub-method capture yet), offline token
 * payments use demand_draft/bank_transfer. */
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mock: "Online Payment",
  demand_draft: "Demand Draft",
  bank_transfer: "Bank Transfer",
};

function toNumber(value: { toNumber(): number } | null | undefined): number {
  return value ? value.toNumber() : 0;
}

// Date-only filters are college-local (IST) days, not UTC days — otherwise
// anything paid between midnight and 05:30 IST lands on the previous day.
const IST_OFFSET = "+05:30";

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000${IST_OFFSET}`);
}

function endOfDay(value: string): Date {
  return new Date(`${value}T23:59:59.999${IST_OFFSET}`);
}

/** Today's IST date as the UTC-midnight Date that @db.Date columns compare
 * against, so a fee due today is not yet overdue. */
function startOfTodayIst(): Date {
  const ist = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
  return new Date(`${ist}T00:00:00.000Z`);
}

/** Largest-remainder rounding so the shares always add up to exactly 100. */
function toWholePercentages(amounts: number[]): number[] {
  const total = amounts.reduce((sum, a) => sum + a, 0);
  if (total <= 0) return amounts.map(() => 0);
  const raw = amounts.map((a) => (a / total) * 100);
  const floored = raw.map(Math.floor);
  let remaining = 100 - floored.reduce((sum, p) => sum + p, 0);
  raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac)
    .forEach(({ i }) => {
      if (remaining > 0) {
        floored[i] += 1;
        remaining -= 1;
      }
    });
  return floored;
}

/** Fees actually billed to a student — course fees from a fee structure.
 * Pay-to-proceed fees (application, token, hostel booking, commute) get a
 * ledger row the moment checkout starts, so an unfinished attempt leaves a
 * "pending" row that nobody owes; those must not count as receivable. */
const BILLED_LEDGER = { feeStructureId: { not: null } };

function dateRangeFilter(from?: string, to?: string) {
  if (!from && !to) return undefined;
  return {
    ...(from ? { gte: parseDateOnly(from) } : {}),
    ...(to ? { lte: endOfDay(to) } : {}),
  };
}

export class FinanceSummaryQuery {
  static async getOverview(
    collegeId: string,
    query: FinanceOverviewQueryInput,
  ) {
    const createdAt = dateRangeFilter(query.from_date, query.to_date);
    const baseWhere = {
      collegeId,
      status: "completed" as const,
      ...(createdAt ? { createdAt } : {}),
    };

    const [
      totalRevenue,
      tuitionFees,
      commuteBooking,
      studentHousingBooking,
      applicationFees,
      tokenFees,
      methodBreakdown,
      overdue,
      ledgerTotals,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: baseWhere,
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          ...baseWhere,
          ledgerEntry: { feeCategory: { in: TUITION_FEE_CATEGORIES } },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          ...baseWhere,
          ledgerEntry: { feeCategory: COMMUTE_FEE_CATEGORY },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          ...baseWhere,
          ledgerEntry: { feeCategory: { in: HOUSING_FEE_CATEGORIES } },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          ...baseWhere,
          ledgerEntry: { feeCategory: APPLICATION_FEE_CATEGORY },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          ...baseWhere,
          ledgerEntry: { feeCategory: TOKEN_FEE_CATEGORY },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["paymentMethod"],
        where: baseWhere,
        _sum: { amount: true },
      }),
      prisma.studentFeeLedger.aggregate({
        where: {
          collegeId,
          ...BILLED_LEDGER,
          status: { not: "paid" },
          dueDate: { lt: startOfTodayIst() },
        },
        _sum: { balanceAmount: true },
      }),
      prisma.studentFeeLedger.aggregate({
        where: { collegeId, ...BILLED_LEDGER },
        _sum: { netAmount: true, paidAmount: true },
      }),
    ]);

    const totalRevenueAmount = toNumber(totalRevenue._sum.amount);
    const methodAmounts = methodBreakdown.map((row) =>
      toNumber(row._sum.amount),
    );
    const methodPercentages = toWholePercentages(methodAmounts);

    const totalNet = toNumber(ledgerTotals._sum.netAmount);
    const totalPaid = toNumber(ledgerTotals._sum.paidAmount);

    const named = {
      tuitionFees: toNumber(tuitionFees._sum.amount),
      commuteBooking: toNumber(commuteBooking._sum.amount),
      studentHousingBooking: toNumber(studentHousingBooking._sum.amount),
      applicationFees: toNumber(applicationFees._sum.amount),
      tokenFees: toNumber(tokenFees._sum.amount),
    };
    // Everything the named cards miss — the other fee-structure categories,
    // legacy free-text values, and transactions with no ledger entry — so the
    // cards always sum to totalRevenue.
    const otherFees = Math.max(
      0,
      roundToPaise(
        totalRevenueAmount -
          Object.values(named).reduce((sum, value) => sum + value, 0),
      ),
    );

    return {
      totalRevenue: totalRevenueAmount.toString(),
      categories: {
        tuitionFees: named.tuitionFees.toString(),
        commuteBooking: named.commuteBooking.toString(),
        studentHousingBooking: named.studentHousingBooking.toString(),
        applicationFees: named.applicationFees.toString(),
        tokenFees: named.tokenFees.toString(),
        otherFees: otherFees.toString(),
      },
      paymentMethodBreakdown: methodBreakdown
        .map((row, i) => ({
          method: row.paymentMethod,
          label: PAYMENT_METHOD_LABELS[row.paymentMethod] ?? row.paymentMethod,
          amount: methodAmounts[i].toString(),
          percentage: methodPercentages[i],
        }))
        .sort((a, b) => Number(b.amount) - Number(a.amount)),
      overdueBalance: toNumber(overdue._sum.balanceAmount).toString(),
      collectionVsTargetPercent:
        totalNet > 0 ? Math.round((totalPaid / totalNet) * 100) : 0,
    };
  }

  /** Receivables aging, unverified offline payments, failed and abandoned
   * payments, and receipt gaps. All-time, like the rest of the overview.
   *
   * The unpaid ledger rows are split three ways with no overlap: billed
   * course fees are receivables; unfinished pay-to-proceed attempts are
   * either failed or abandoned (failed wins). Failed/abandoned are measured
   * per fee, not per attempt, so a retried payment counts once and a
   * recovered one not at all. */
  static async getCollectionsHealth(collegeId: string) {
    const today = startOfTodayIst();
    const dayMs = 24 * 60 * 60 * 1000;
    const daysBefore = (days: number) =>
      new Date(today.getTime() - days * dayMs);
    const now = new Date();
    // Online orders left pending this long were abandoned at checkout.
    const abandonedCutoff = new Date(now.getTime() - dayMs);
    // Receipts are issued by a background job; give it time before flagging.
    const receiptCutoff = new Date(now.getTime() - 60 * 60 * 1000);

    const unpaid = {
      collegeId,
      status: { not: "paid" },
      balanceAmount: { gt: 0 },
    };
    const bucket = (dueDate: Prisma.DateTimeNullableFilter | null) =>
      prisma.studentFeeLedger.aggregate({
        where: { ...unpaid, ...BILLED_LEDGER, dueDate },
        _sum: { balanceAmount: true },
        _count: { _all: true },
      });
    const unpaidAttempt = { ...unpaid, feeStructureId: null };
    const beingResubmitted = {
      none: { verificationStatus: "pending_verification" },
    };

    const [
      notYetDue,
      overdue1to30,
      overdue31to60,
      overdue61to90,
      overdue90plus,
      noDueDate,
      awaitingVerification,
      failed,
      abandoned,
      missingReceipts,
    ] = await Promise.all([
      bucket({ gte: today }),
      bucket({ lt: today, gte: daysBefore(30) }),
      bucket({ lt: daysBefore(30), gte: daysBefore(60) }),
      bucket({ lt: daysBefore(60), gte: daysBefore(90) }),
      bucket({ lt: daysBefore(90) }),
      bucket(null),
      prisma.transaction.aggregate({
        where: { collegeId, verificationStatus: "pending_verification" },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.studentFeeLedger.aggregate({
        where: {
          ...unpaidAttempt,
          AND: [
            {
              transactions: {
                some: { status: { in: ["failed", "rejected"] } },
              },
            },
            { transactions: beingResubmitted },
          ],
        },
        _sum: { balanceAmount: true },
        _count: { _all: true },
      }),
      prisma.studentFeeLedger.aggregate({
        where: {
          ...unpaidAttempt,
          AND: [
            {
              transactions: {
                some: {
                  status: "pending",
                  verificationStatus: "not_required",
                  createdAt: { lt: abandonedCutoff },
                },
              },
            },
            {
              transactions: {
                none: { status: { in: ["failed", "rejected"] } },
              },
            },
            {
              transactions: {
                none: {
                  status: "pending",
                  createdAt: { gte: abandonedCutoff },
                },
              },
            },
            { transactions: beingResubmitted },
          ],
        },
        _sum: { balanceAmount: true },
        _count: { _all: true },
      }),
      prisma.transaction.aggregate({
        where: {
          collegeId,
          status: "completed",
          receipt: { is: null },
          OR: [
            { paidAt: { lt: receiptCutoff } },
            { paidAt: null, createdAt: { lt: receiptCutoff } },
          ],
        },
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    type LedgerSum = {
      _sum: { balanceAmount: { toNumber(): number } | null };
      _count: { _all: number };
    };
    const toBucket = (key: string, label: string, row: LedgerSum) => ({
      key,
      label,
      amount: toNumber(row._sum.balanceAmount),
      count: row._count._all,
    });
    const ledgerSum = (row: LedgerSum) => ({
      amount: toNumber(row._sum.balanceAmount),
      count: row._count._all,
    });

    const aging = [
      toBucket("not_yet_due", "Not yet due", notYetDue),
      toBucket("overdue_1_30", "1–30 days overdue", overdue1to30),
      toBucket("overdue_31_60", "31–60 days overdue", overdue31to60),
      toBucket("overdue_61_90", "61–90 days overdue", overdue61to90),
      toBucket("overdue_90_plus", "90+ days overdue", overdue90plus),
      toBucket("no_due_date", "No due date", noDueDate),
    ];

    return {
      receivables: {
        totalOutstanding: roundToPaise(
          aging.reduce((sum, b) => sum + b.amount, 0),
        ),
        aging,
      },
      awaitingVerification: {
        amount: toNumber(awaitingVerification._sum.amount),
        count: awaitingVerification._count._all,
      },
      failedPayments: ledgerSum(failed),
      abandonedPayments: ledgerSum(abandoned),
      missingReceipts: {
        amount: toNumber(missingReceipts._sum.amount),
        count: missingReceipts._count._all,
      },
    };
  }

  /** Completed revenue per course. A payment reaches its course through the
   * ledger entry's application course, enrollment, or — for course fees —
   * fee structure. Hostel booking, commute and other non-course payments fall
   * into the null-course row, so the rows sum to totalRevenue. */
  static async getRevenueByCourse(collegeId: string) {
    const rows = await prisma.$queryRaw<
      {
        course_id: string | null;
        course_name: string | null;
        amount: Prisma.Decimal | null;
        count: number;
      }[]
    >`
      SELECT
        COALESCE(ac.course_id, e.course_id, fs.course_id) AS course_id,
        c.name AS course_name,
        SUM(t.amount) AS amount,
        COUNT(*)::int AS count
      FROM transactions t
      LEFT JOIN student_fee_ledger l ON l.id = t.ledger_entry_id
      LEFT JOIN application_courses ac ON ac.id = l.application_course_id
      LEFT JOIN enrollments e ON e.id = l.enrollment_id
      LEFT JOIN fee_structures fs ON fs.id = l.fee_structure_id
      LEFT JOIN courses c ON c.id = COALESCE(ac.course_id, e.course_id, fs.course_id)
      WHERE t.college_id = ${collegeId} AND t.status = 'completed'
      GROUP BY COALESCE(ac.course_id, e.course_id, fs.course_id), c.name
      ORDER BY SUM(t.amount) DESC
    `;

    return rows.map((row) => ({
      courseId: row.course_id,
      courseName: row.course_name ?? "Not linked to a course",
      amount: row.amount ? Number(row.amount) : 0,
      count: row.count,
    }));
  }

  private static buildTransactionsWhere(
    collegeId: string,
    filters: {
      from_date?: string;
      to_date?: string;
      course_id?: string;
      fee_category?: string;
      payment_method?: string;
    },
  ) {
    const createdAt = dateRangeFilter(filters.from_date, filters.to_date);
    return {
      collegeId,
      ...(createdAt ? { createdAt } : {}),
      ...(filters.payment_method
        ? { paymentMethod: filters.payment_method }
        : {}),
      ...(filters.fee_category || filters.course_id
        ? {
            ledgerEntry: {
              ...(filters.fee_category
                ? { feeCategory: filters.fee_category }
                : {}),
              ...(filters.course_id
                ? {
                    OR: [
                      { applicationCourse: { courseId: filters.course_id } },
                      { enrollment: { courseId: filters.course_id } },
                      { feeStructure: { courseId: filters.course_id } },
                    ],
                  }
                : {}),
            },
          }
        : {}),
    };
  }

  private static mapTransactionRow(row: {
    id: string;
    transactionNumber: string;
    amount: { toString(): string };
    paymentMethod: string;
    status: string;
    createdAt: Date;
    student: { id: string; fullName: string };
    ledgerEntry: { feeCategory: string } | null;
  }) {
    const statusMap: Record<string, string> = {
      completed: "success",
      pending: "pending",
      failed: "failed",
      rejected: "failed",
    };
    return {
      id: row.id,
      transactionNumber: row.transactionNumber,
      time: row.createdAt.toISOString(),
      studentId: row.student.id,
      studentName: row.student.fullName,
      feeCategory: row.ledgerEntry?.feeCategory ?? null,
      paymentMethod: row.paymentMethod,
      paymentMethodLabel:
        PAYMENT_METHOD_LABELS[row.paymentMethod] ?? row.paymentMethod,
      amount: row.amount.toString(),
      direction: "credit" as const,
      status: statusMap[row.status] ?? row.status,
    };
  }

  static async listTransactions(
    collegeId: string,
    query: FinanceTransactionsQueryInput,
  ) {
    const where = this.buildTransactionsWhere(collegeId, query);

    const [rows, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        select: {
          id: true,
          transactionNumber: true,
          amount: true,
          paymentMethod: true,
          status: true,
          createdAt: true,
          student: { select: { id: true, fullName: true } },
          ledgerEntry: { select: { feeCategory: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: rows.map((row) => this.mapTransactionRow(row)),
      meta: PaginationHelper.createMeta(total, query.page, query.limit),
    };
  }

  /** Same filters as listTransactions, unpaginated (capped) for CSV export. */
  static async listTransactionsForExport(
    collegeId: string,
    query: FinanceTransactionsExportQueryInput,
  ) {
    const where = this.buildTransactionsWhere(collegeId, query);

    const rows = await prisma.transaction.findMany({
      where,
      select: {
        id: true,
        transactionNumber: true,
        amount: true,
        paymentMethod: true,
        status: true,
        createdAt: true,
        student: { select: { id: true, fullName: true } },
        ledgerEntry: { select: { feeCategory: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    return rows.map((row) => this.mapTransactionRow(row));
  }
}
