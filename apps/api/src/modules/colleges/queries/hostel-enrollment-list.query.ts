import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";

const ENROLLMENT_SELECT = {
  id: true,
  status: true,
  roomPlanType: true,
  dietaryPreference: true,
  selectedAddons: true,
  feeBreakdown: true,
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
  hostel: { select: { id: true, name: true, hostelType: true } },
  roomType: {
    select: {
      id: true,
      name: true,
      annualPlanPrice: true,
      monthlyPlanPrice: true,
      admissionFee: true,
      securityDeposit: true,
    },
  },
  messPlan: {
    select: { id: true, name: true, priceMonthly: true },
  },
} as const;

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

type EnrollmentRow = {
  id: string;
  status: string;
  roomPlanType: string;
  dietaryPreference: string | null;
  selectedAddons: unknown;
  feeBreakdown: unknown;
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
  hostel: { id: string; name: string; hostelType: string };
  roomType: {
    id: string;
    name: string;
    annualPlanPrice: { toString(): string } | null;
    monthlyPlanPrice: { toString(): string } | null;
    admissionFee: { toString(): string };
    securityDeposit: { toString(): string };
  };
  messPlan: {
    id: string;
    name: string;
    priceMonthly: { toString(): string };
  } | null;
};

function mapEnrollment(row: EnrollmentRow) {
  return {
    id: row.id,
    status: row.status,
    roomPlanType: row.roomPlanType,
    dietaryPreference: row.dietaryPreference,
    selectedAddons: row.selectedAddons,
    feeBreakdown: row.feeBreakdown,
    enrolledFrom: toDateString(row.enrolledFrom),
    enrolledUntil: row.enrolledUntil ? toDateString(row.enrolledUntil) : null,
    createdAt: row.createdAt.toISOString(),
    student: row.student,
    hostel: row.hostel,
    roomType: {
      id: row.roomType.id,
      name: row.roomType.name,
      annualPlanPrice: row.roomType.annualPlanPrice
        ? row.roomType.annualPlanPrice.toString()
        : null,
      monthlyPlanPrice: row.roomType.monthlyPlanPrice
        ? row.roomType.monthlyPlanPrice.toString()
        : null,
      admissionFee: row.roomType.admissionFee.toString(),
      securityDeposit: row.roomType.securityDeposit.toString(),
    },
    messPlan: row.messPlan
      ? {
          id: row.messPlan.id,
          name: row.messPlan.name,
          priceMonthly: row.messPlan.priceMonthly.toString(),
        }
      : null,
  };
}

export class HostelEnrollmentListQuery {
  static async listForCollege(
    collegeId: string,
    filters: {
      hostelId?: string;
      roomTypeId?: string;
      status?: string;
      search?: string;
    },
    pagination: { page: number; limit: number },
  ) {
    const where = {
      collegeId,
      ...(filters.hostelId && { hostelId: filters.hostelId }),
      ...(filters.roomTypeId && { roomTypeId: filters.roomTypeId }),
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
      prisma.hostelEnrollment.findMany({
        where,
        select: ENROLLMENT_SELECT,
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.hostelEnrollment.count({ where }),
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
    const row = await prisma.hostelEnrollment.findFirst({
      where: { id: enrollmentId, collegeId },
      select: ENROLLMENT_SELECT,
    });
    if (!row) throw new NotFoundError("Hostel enrollment not found");

    const ledgerRows = await prisma.studentFeeLedger.findMany({
      where: { studentId: row.student.id, feeCategory: "hostel_booking_fee" },
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
