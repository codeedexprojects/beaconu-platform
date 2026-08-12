import { prisma, Prisma } from "@beaconu/db";

const SELECT = {
  id: true,
  studentId: true,
  collegeId: true,
  enrollmentId: true,
  toCourseId: true,
  reason: true,
  supportingDocuments: true,
  status: true,
  processedBy: true,
  remarks: true,
  processedAt: true,
  newEnrollmentId: true,
  createdAt: true,
  updatedAt: true,
  enrollment: {
    select: { course: { select: { name: true, code: true } } },
  },
  toCourse: { select: { name: true, code: true } },
} as const;

export class CourseSwitchRequestRepository {
  static async findPendingForEnrollment(enrollmentId: string) {
    return prisma.courseSwitchRequest.findFirst({
      where: { enrollmentId, status: "pending" },
      select: { id: true },
    });
  }

  static async create(data: {
    studentId: string;
    collegeId: string;
    enrollmentId: string;
    toCourseId: string;
    reason: string;
    supportingDocuments: unknown[];
  }) {
    return prisma.courseSwitchRequest.create({
      data: {
        studentId: data.studentId,
        collegeId: data.collegeId,
        enrollmentId: data.enrollmentId,
        toCourseId: data.toCourseId,
        reason: data.reason,
        supportingDocuments:
          data.supportingDocuments as Prisma.InputJsonValue[],
      },
      select: SELECT,
    });
  }

  static async findById(id: string) {
    return prisma.courseSwitchRequest.findUnique({
      where: { id },
      select: SELECT,
    });
  }

  static async listForStudent(studentId: string) {
    return prisma.courseSwitchRequest.findMany({
      where: { studentId },
      select: SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async listForCollege(
    collegeId: string,
    filters: { status?: string },
    pagination: { page: number; limit: number },
  ) {
    const where = {
      collegeId,
      ...(filters.status && { status: filters.status }),
    };
    const [rows, total] = await prisma.$transaction([
      prisma.courseSwitchRequest.findMany({
        where,
        select: {
          ...SELECT,
          student: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.courseSwitchRequest.count({ where }),
    ]);
    return { rows, total };
  }

  static async reject(id: string, processedBy: string, remarks: string | null) {
    return prisma.courseSwitchRequest.update({
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
      newEnrollmentId: string;
    },
  ) {
    return tx.courseSwitchRequest.update({
      where: { id },
      data: {
        status: "approved",
        processedBy: data.processedBy,
        processedAt: new Date(),
        remarks: data.remarks,
        newEnrollmentId: data.newEnrollmentId,
      },
      select: SELECT,
    });
  }
}
