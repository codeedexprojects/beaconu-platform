import { prisma } from "@beaconu/db";
import { PaginationHelper } from "@/shared/responses/pagination";
import {
  FinanceOverviewQueryInput,
  FinanceTransactionsExportQueryInput,
  FinanceTransactionsQueryInput,
} from "../validators/finance.validator";

const TUITION_FEE_CATEGORIES = ["tuition_fee", "semester_fees", "tution fee"];
const COMMUTE_FEE_CATEGORY = "commute_fee";
const HOUSING_FEE_CATEGORY = "hostel_booking_fee";
const APPLICATION_FEE_CATEGORY = "application_fee";

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

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function endOfDay(value: string): Date {
  return new Date(`${value}T23:59:59.999Z`);
}

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
          ledgerEntry: { feeCategory: HOUSING_FEE_CATEGORY },
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
      prisma.transaction.groupBy({
        by: ["paymentMethod"],
        where: baseWhere,
        _sum: { amount: true },
      }),
      prisma.studentFeeLedger.aggregate({
        where: {
          collegeId,
          status: { not: "paid" },
          dueDate: { lt: new Date() },
        },
        _sum: { balanceAmount: true },
      }),
      prisma.studentFeeLedger.aggregate({
        where: { collegeId },
        _sum: { netAmount: true, paidAmount: true },
      }),
    ]);

    const totalRevenueAmount = toNumber(totalRevenue._sum.amount);
    const methodTotal = methodBreakdown.reduce(
      (sum, row) => sum + toNumber(row._sum.amount),
      0,
    );

    const totalNet = toNumber(ledgerTotals._sum.netAmount);
    const totalPaid = toNumber(ledgerTotals._sum.paidAmount);

    return {
      totalRevenue: totalRevenueAmount.toString(),
      categories: {
        tuitionFees: toNumber(tuitionFees._sum.amount).toString(),
        commuteBooking: toNumber(commuteBooking._sum.amount).toString(),
        studentHousingBooking: toNumber(
          studentHousingBooking._sum.amount,
        ).toString(),
        applicationFees: toNumber(applicationFees._sum.amount).toString(),
      },
      paymentMethodBreakdown: methodBreakdown
        .map((row) => {
          const amount = toNumber(row._sum.amount);
          return {
            method: row.paymentMethod,
            label:
              PAYMENT_METHOD_LABELS[row.paymentMethod] ?? row.paymentMethod,
            amount: amount.toString(),
            percentage:
              methodTotal > 0 ? Math.round((amount / methodTotal) * 100) : 0,
          };
        })
        .sort((a, b) => Number(b.amount) - Number(a.amount)),
      overdueBalance: toNumber(overdue._sum.balanceAmount).toString(),
      collectionVsTargetPercent:
        totalNet > 0 ? Math.round((totalPaid / totalNet) * 100) : 0,
    };
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
