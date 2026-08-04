import { prisma } from "@beaconu/db";

const ADMIN_SELECT = {
  id: true,
  courseId: true,
  collegeQuotaId: true,
  appFeeAdjustmentType: true,
  appFeeAdjustmentValue: true,
  tuitionFeeOverride: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  collegeQuota: {
    select: {
      id: true,
      name: true,
      slug: true,
      bucketType: true,
      isActive: true,
    },
  },
} as const;

export class CourseQuotaRepository {
  static async findCourseInCollege(courseId: string, collegeId: string) {
    return prisma.course.findFirst({
      where: { id: courseId, collegeId },
      select: { id: true },
    });
  }

  static async findCollegeQuotaInCollege(
    collegeQuotaId: string,
    collegeId: string,
  ) {
    return prisma.collegeQuota.findFirst({
      where: { id: collegeQuotaId, collegeId },
      select: { id: true, isActive: true },
    });
  }

  static async findByCourseId(courseId: string) {
    return prisma.courseQuota.findMany({
      where: { courseId },
      select: ADMIN_SELECT,
      orderBy: { createdAt: "asc" },
    });
  }

  static async findByCourseAndCollegeQuota(
    courseId: string,
    collegeQuotaId: string,
  ) {
    return prisma.courseQuota.findUnique({
      where: { uq_course_college_quota: { courseId, collegeQuotaId } },
      select: ADMIN_SELECT,
    });
  }

  static async reactivate(
    courseQuotaId: string,
    data: {
      appFeeAdjustmentType: string | null;
      appFeeAdjustmentValue: number | null;
      tuitionFeeOverride: number | null;
    },
  ) {
    return prisma.courseQuota.update({
      where: { id: courseQuotaId },
      data: { ...data, isActive: true },
      select: ADMIN_SELECT,
    });
  }

  static async findById(courseId: string, courseQuotaId: string) {
    return prisma.courseQuota.findFirst({
      where: { id: courseQuotaId, courseId },
      select: ADMIN_SELECT,
    });
  }

  static async create(data: {
    courseId: string;
    collegeQuotaId: string;
    appFeeAdjustmentType: string | null;
    appFeeAdjustmentValue: number | null;
    tuitionFeeOverride: number | null;
  }) {
    return prisma.courseQuota.create({ data, select: ADMIN_SELECT });
  }

  static async update(
    courseId: string,
    courseQuotaId: string,
    data: Record<string, unknown>,
  ) {
    const existing = await prisma.courseQuota.findFirst({
      where: { id: courseQuotaId, courseId },
      select: { id: true },
    });
    if (!existing) return null;

    return prisma.courseQuota.update({
      where: { id: courseQuotaId },
      data: data as any,
      select: ADMIN_SELECT,
    });
  }

  static async softDeleteById(courseId: string, courseQuotaId: string) {
    const existing = await prisma.courseQuota.findFirst({
      where: { id: courseQuotaId, courseId },
      select: { id: true },
    });
    if (!existing) return null;

    return prisma.courseQuota.update({
      where: { id: courseQuotaId },
      data: { isActive: false },
      select: ADMIN_SELECT,
    });
  }
}
