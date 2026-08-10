import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";

const ENROLLMENT_SELECT = {
  id: true,
  status: true,
  enrolledFrom: true,
  enrolledUntil: true,
  createdAt: true,
  student: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      phoneCountryCode: true,
    },
  },
  route: { select: { id: true, name: true } },
  bus: {
    select: {
      id: true,
      busNumber: true,
      busName: true,
      driverName: true,
      driverPhone: true,
      driverStatus: true,
      monthlyFee: true,
    },
  },
  pickupStop: {
    select: { id: true, stopName: true, morningTime: true, eveningTime: true },
  },
} as const;

function toTimeString(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(11, 16);
}

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

type EnrollmentRow = {
  id: string;
  status: string;
  enrolledFrom: Date;
  enrolledUntil: Date | null;
  createdAt: Date;
  student: {
    id: string;
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
    phoneCountryCode: string | null;
  };
  route: { id: string; name: string };
  bus: {
    id: string;
    busNumber: string;
    busName: string | null;
    driverName: string | null;
    driverPhone: string | null;
    driverStatus: string;
    monthlyFee: { toString(): string };
  };
  pickupStop: {
    id: string;
    stopName: string;
    morningTime: Date | null;
    eveningTime: Date | null;
  };
};

function mapEnrollment(row: EnrollmentRow) {
  return {
    id: row.id,
    status: row.status,
    enrolledFrom: toDateString(row.enrolledFrom),
    enrolledUntil: row.enrolledUntil ? toDateString(row.enrolledUntil) : null,
    createdAt: row.createdAt.toISOString(),
    student: row.student,
    route: row.route,
    bus: { ...row.bus, monthlyFee: row.bus.monthlyFee.toString() },
    pickupStop: {
      id: row.pickupStop.id,
      stopName: row.pickupStop.stopName,
      morningTime: toTimeString(row.pickupStop.morningTime),
      eveningTime: toTimeString(row.pickupStop.eveningTime),
    },
  };
}

export class CommuteEnrollmentListQuery {
  static async listForCollege(
    collegeId: string,
    filters: {
      routeId?: string;
      busId?: string;
      status?: string;
      search?: string;
    },
    pagination: { page: number; limit: number },
  ) {
    const where = {
      collegeId,
      ...(filters.routeId && { routeId: filters.routeId }),
      ...(filters.busId && { busId: filters.busId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.search && {
        student: {
          OR: [
            {
              fullName: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
            {
              email: { contains: filters.search, mode: "insensitive" as const },
            },
            {
              phoneNumber: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
          ],
        },
      }),
    };

    const [rows, total] = await prisma.$transaction([
      prisma.commuteEnrollment.findMany({
        where,
        select: ENROLLMENT_SELECT,
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.commuteEnrollment.count({ where }),
    ]);

    return {
      data: rows.map(mapEnrollment),
      meta: PaginationHelper.createMeta(
        total,
        pagination.page,
        pagination.limit,
      ),
    };
  }

  static async getForCollege(collegeId: string, enrollmentId: string) {
    const row = await prisma.commuteEnrollment.findFirst({
      where: { id: enrollmentId, collegeId },
      select: ENROLLMENT_SELECT,
    });
    if (!row) throw new NotFoundError("Commute enrollment not found");

    const ledgerRows = await prisma.studentFeeLedger.findMany({
      where: { studentId: row.student.id, feeCategory: "commute_fee" },
      select: {
        id: true,
        description: true,
        netAmount: true,
        paidAmount: true,
        balanceAmount: true,
        status: true,
        createdAt: true,
        transactions: {
          select: {
            id: true,
            transactionNumber: true,
            amount: true,
            status: true,
            paymentMethod: true,
            paidAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const payments = ledgerRows.map((ledger) => ({
      id: ledger.id,
      description: ledger.description,
      amount: ledger.netAmount.toString(),
      paidAmount: ledger.paidAmount.toString(),
      balanceAmount: ledger.balanceAmount.toString(),
      status: ledger.status,
      createdAt: ledger.createdAt.toISOString(),
      transactions: ledger.transactions.map((txn) => ({
        id: txn.id,
        transactionNumber: txn.transactionNumber,
        amount: txn.amount.toString(),
        status: txn.status,
        paymentMethod: txn.paymentMethod,
        paidAt: txn.paidAt ? txn.paidAt.toISOString() : null,
        createdAt: txn.createdAt.toISOString(),
      })),
    }));

    return { ...mapEnrollment(row), payments };
  }
}
