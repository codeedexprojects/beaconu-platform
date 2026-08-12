import { prisma, Prisma } from "@beaconu/db";

const SELECT = {
  id: true,
  applicationCourseId: true,
  studentId: true,
  reason: true,
  supportingDocUrls: true,
  status: true,
  refundAmount: true,
  refundStatus: true,
  processedBy: true,
  remarks: true,
  requestedAt: true,
  processedAt: true,
  applicationCourse: {
    select: {
      course: { select: { name: true, code: true } },
      application: { select: { collegeId: true } },
    },
  },
} as const;

export class SeatCancellationRepository {
  static async findPendingForApplicationCourse(applicationCourseId: string) {
    return prisma.seatCancellation.findFirst({
      where: { applicationCourseId, status: "pending" },
      select: { id: true },
    });
  }

  static async create(data: {
    applicationCourseId: string;
    studentId: string;
    reason: string;
    supportingDocUrls: unknown[];
  }) {
    return prisma.seatCancellation.create({
      data: {
        applicationCourseId: data.applicationCourseId,
        studentId: data.studentId,
        reason: data.reason,
        supportingDocUrls: data.supportingDocUrls as Prisma.InputJsonValue[],
      },
      select: SELECT,
    });
  }

  static async findById(id: string) {
    return prisma.seatCancellation.findUnique({
      where: { id },
      select: SELECT,
    });
  }

  static async listForStudent(studentId: string) {
    return prisma.seatCancellation.findMany({
      where: { studentId },
      select: SELECT,
      orderBy: { requestedAt: "desc" },
    });
  }

  static async listForCollege(
    collegeId: string,
    filters: { status?: string },
    pagination: { page: number; limit: number },
  ) {
    const where = {
      applicationCourse: { application: { collegeId } },
      ...(filters.status && { status: filters.status }),
    };
    const [rows, total] = await prisma.$transaction([
      prisma.seatCancellation.findMany({
        where,
        select: {
          ...SELECT,
          student: { select: { fullName: true, email: true } },
        },
        orderBy: { requestedAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.seatCancellation.count({ where }),
    ]);
    return { rows, total };
  }

  static async reject(id: string, processedBy: string, remarks: string | null) {
    return prisma.seatCancellation.update({
      where: { id },
      data: {
        status: "rejected",
        processedBy,
        processedAt: new Date(),
        remarks,
      },
      select: SELECT,
    });
  }

  static async approve(
    tx: Prisma.TransactionClient,
    id: string,
    data: {
      processedBy: string;
      remarks: string | null;
      refundAmount: number | null;
      refundStatus: string | null;
    },
  ) {
    return tx.seatCancellation.update({
      where: { id },
      data: {
        status: "approved",
        processedBy: data.processedBy,
        processedAt: new Date(),
        remarks: data.remarks,
        refundAmount: data.refundAmount,
        refundStatus: data.refundStatus,
      },
      select: SELECT,
    });
  }
}
