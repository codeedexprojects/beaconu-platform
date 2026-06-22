import { prisma, Prisma } from "@beaconu/db";

interface PaginationOptions {
  page?: number;
  limit?: number;
}

export class RefundRepository {
  private static paginate({ page = 1, limit = 20 }: PaginationOptions) {
    const normalizedPage = Math.max(1, Number(page) || 1);
    const normalizedLimit = Math.max(1, Number(limit) || 20);
    return {
      skip: (normalizedPage - 1) * normalizedLimit,
      take: normalizedLimit,
    };
  }

  static async findPendingBySessionId(sessionId: string) {
    return prisma.counsellingRefundRequest.findFirst({
      where: { sessionId, status: "pending" },
    });
  }

  static async findBySessionIds(sessionIds: string[]) {
    if (sessionIds.length === 0) return [];
    return prisma.counsellingRefundRequest.findMany({
      where: { sessionId: { in: sessionIds } },
      orderBy: { createdAt: "desc" },
      select: { sessionId: true, status: true },
    });
  }

  static async create(data: {
    sessionId: string;
    studentId: string;
    counsellorId: string;
    amount: number;
    upiId: string;
    reason: string;
    proofUrl?: string;
  }) {
    return prisma.counsellingRefundRequest.create({ data });
  }

  static async listByStudent(
    studentId: string,
    pagination: PaginationOptions = {},
  ) {
    const [total, rows] = await Promise.all([
      prisma.counsellingRefundRequest.count({ where: { studentId } }),
      prisma.counsellingRefundRequest.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" },
        include: {
          session: {
            select: {
              id: true,
              scheduledDate: true,
              startTime: true,
              counsellor: { select: { fullName: true } },
            },
          },
        },
        ...this.paginate(pagination),
      }),
    ]);
    return { rows, total };
  }

  static async listAll(
    filters: { status?: string },
    pagination: PaginationOptions = {},
  ) {
    const where: Prisma.CounsellingRefundRequestWhereInput = {
      status: filters.status ?? undefined,
    };
    const [total, rows] = await Promise.all([
      prisma.counsellingRefundRequest.count({ where }),
      prisma.counsellingRefundRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: { id: true, fullName: true, email: true },
          },
          counsellor: {
            select: { id: true, fullName: true, email: true },
          },
          session: {
            select: {
              id: true,
              scheduledDate: true,
              startTime: true,
              endTime: true,
            },
          },
        },
        ...this.paginate(pagination),
      }),
    ]);
    return { rows, total };
  }

  static async findById(id: string) {
    return prisma.counsellingRefundRequest.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        counsellor: { select: { id: true, fullName: true, email: true } },
        session: true,
      },
    });
  }

  static async updateStatus(
    id: string,
    status: "approved" | "rejected",
    adminId: string,
    remarks: string | undefined,
  ) {
    return prisma.counsellingRefundRequest.update({
      where: { id },
      data: {
        status,
        reviewedBy: adminId,
        reviewRemarks: remarks,
      },
    });
  }
}
