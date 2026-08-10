import { prisma, Prisma } from "@beaconu/db";

const ADMIN_SELECT = {
  id: true,
  courseId: true,
  collegeId: true,
  academicYear: true,
  feeCategory: true,
  amount: true,
  yearOrSemester: true,
  description: true,
  dueDate: true,
  gender: true,
  instalmentAllowed: true,
  instalmentConfig: true,
  feePdfUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const PUBLIC_SELECT = {
  id: true,
  feeCategory: true,
  amount: true,
  yearOrSemester: true,
  description: true,
  dueDate: true,
  gender: true,
  instalmentAllowed: true,
  instalmentConfig: true,
  feePdfUrl: true,
} as const;

export class FeeStructureRepository {
  static async findCourseInCollege(courseId: string, collegeId: string) {
    return prisma.course.findFirst({
      where: { id: courseId, collegeId },
      select: { id: true },
    });
  }

  static async findByCourseId(courseId: string) {
    return prisma.feeStructure.findMany({
      where: { courseId },
      select: ADMIN_SELECT,
      orderBy: [{ yearOrSemester: "asc" }, { feeCategory: "asc" }],
    });
  }

  static async findById(courseId: string, feeStructureId: string) {
    return prisma.feeStructure.findFirst({
      where: { id: feeStructureId, courseId },
      select: ADMIN_SELECT,
    });
  }

  static async create(data: {
    courseId: string;
    collegeId: string;
    academicYear: string;
    feeCategory: string;
    amount: number;
    yearOrSemester?: string | null;
    description?: string | null;
    dueDate?: Date | null;
    gender?: string;
    instalmentAllowed?: boolean;
    instalmentConfig?: Prisma.InputJsonValue;
    feePdfUrl?: string | null;
  }) {
    return prisma.feeStructure.create({ data, select: ADMIN_SELECT });
  }

  static async update(
    courseId: string,
    feeStructureId: string,
    data: Prisma.FeeStructureUpdateInput,
  ) {
    const existing = await prisma.feeStructure.findFirst({
      where: { id: feeStructureId, courseId },
      select: { id: true },
    });
    if (!existing) return null;

    return prisma.feeStructure.update({
      where: { id: feeStructureId },
      data,
      select: ADMIN_SELECT,
    });
  }

  static async softDeleteById(courseId: string, feeStructureId: string) {
    const existing = await prisma.feeStructure.findFirst({
      where: { id: feeStructureId, courseId },
      select: { id: true },
    });
    if (!existing) return null;

    return prisma.feeStructure.update({
      where: { id: feeStructureId },
      data: { isActive: false },
      select: ADMIN_SELECT,
    });
  }

  static async findActivePublicByCourseId(
    courseId: string,
    collegeSlug: string,
  ) {
    return prisma.feeStructure.findMany({
      where: {
        courseId,
        isActive: true,
        college: { slug: collegeSlug, status: "active" },
      },
      select: PUBLIC_SELECT,
      orderBy: [{ yearOrSemester: "asc" }, { feeCategory: "asc" }],
    });
  }
}
