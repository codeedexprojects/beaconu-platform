import { prisma } from "@beaconu/db";

const STUDENT_LIST_SELECT = {
  id: true,
  collegeId: true,
  phoneNumber: true,
  preferredTime: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  college: { select: { name: true } },
} as const;

const ADMIN_LIST_SELECT = {
  id: true,
  studentId: true,
  phoneNumber: true,
  preferredTime: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  student: { select: { fullName: true, email: true } },
} as const;

const DETAIL_SELECT = {
  id: true,
  collegeId: true,
  studentId: true,
  phoneNumber: true,
  preferredTime: true,
  message: true,
  status: true,
  staffNote: true,
  respondedAt: true,
  createdAt: true,
  updatedAt: true,
  college: { select: { name: true } },
  student: { select: { fullName: true, email: true, phoneNumber: true } },
  responder: { select: { fullName: true } },
} as const;

function buildSearchFilter(search: string) {
  return {
    OR: [
      { phoneNumber: { contains: search, mode: "insensitive" as const } },
      {
        student: {
          fullName: { contains: search, mode: "insensitive" as const },
        },
      },
    ],
  };
}

export class CallRequestRepository {
  static async findCollege(collegeId: string) {
    return prisma.college.findUnique({
      where: { id: collegeId },
      select: { id: true },
    });
  }

  static async findStudentPhone(studentId: string) {
    return prisma.student.findUnique({
      where: { id: studentId },
      select: { phoneNumber: true },
    });
  }

  static async findActivePendingForStudentAndCollege(
    studentId: string,
    collegeId: string,
  ) {
    return prisma.callRequest.findFirst({
      where: { studentId, collegeId, status: "pending" },
      select: { id: true },
    });
  }

  static async create(data: {
    studentId: string;
    collegeId: string;
    phoneNumber: string;
    preferredTime: string | null;
    message: string | null;
  }) {
    return prisma.callRequest.create({
      data: {
        studentId: data.studentId,
        collegeId: data.collegeId,
        phoneNumber: data.phoneNumber,
        preferredTime: data.preferredTime,
        message: data.message,
      },
      select: DETAIL_SELECT,
    });
  }

  static async findByIdForStudent(id: string, studentId: string) {
    return prisma.callRequest.findFirst({
      where: { id, studentId },
      select: DETAIL_SELECT,
    });
  }

  static async findByIdForCollege(id: string, collegeId: string) {
    return prisma.callRequest.findFirst({
      where: { id, collegeId },
      select: DETAIL_SELECT,
    });
  }

  static async listForStudent(
    studentId: string,
    filters: { status?: string },
    pagination: { page: number; limit: number },
  ) {
    const where = {
      studentId,
      ...(filters.status && { status: filters.status }),
    };

    const [rows, total] = await prisma.$transaction([
      prisma.callRequest.findMany({
        where,
        select: STUDENT_LIST_SELECT,
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.callRequest.count({ where }),
    ]);

    return { rows, total };
  }

  static async listForCollege(
    collegeId: string,
    filters: { status?: string; search?: string },
    pagination: { page: number; limit: number },
  ) {
    const where = {
      collegeId,
      ...(filters.status && { status: filters.status }),
      ...(filters.search && buildSearchFilter(filters.search)),
    };

    const [rows, total] = await prisma.$transaction([
      prisma.callRequest.findMany({
        where,
        select: ADMIN_LIST_SELECT,
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.callRequest.count({ where }),
    ]);

    return { rows, total };
  }

  static async updateStatus(
    id: string,
    data: {
      status: string;
      staffNote?: string | null;
      respondedBy?: string | null;
      respondedAt?: Date | null;
    },
  ) {
    return prisma.callRequest.update({
      where: { id },
      data,
      select: DETAIL_SELECT,
    });
  }
}
