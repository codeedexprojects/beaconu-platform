import { prisma } from "@beaconu/db";

const SELECT = {
  id: true,
  admissionCycleCourseId: true,
  collegeQuotaId: true,
  seatPoolId: true,
  totalSeats: true,
  openSeats: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  collegeQuota: {
    select: { id: true, name: true, slug: true, bucketType: true },
  },
  seatPool: {
    select: { id: true, totalSeats: true, openSeats: true },
  },
} as const;

export class CourseQuotaSeatsRepository {
  static async findCourseInCycle(
    admissionCycleId: string,
    courseId: string,
    collegeId: string,
  ) {
    return prisma.admissionCycleCourse.findFirst({
      where: { admissionCycleId, courseId, admissionCycle: { collegeId } },
      select: { id: true, isActive: true },
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

  static async findByAdmissionCycleCourseId(admissionCycleCourseId: string) {
    return prisma.courseQuotaSeats.findMany({
      where: { admissionCycleCourseId },
      select: SELECT,
      orderBy: { createdAt: "asc" },
    });
  }

  static async findById(admissionCycleCourseId: string, id: string) {
    return prisma.courseQuotaSeats.findFirst({
      where: { id, admissionCycleCourseId },
      select: SELECT,
    });
  }

  static async findByCourseAndQuota(
    admissionCycleCourseId: string,
    collegeQuotaId: string,
  ) {
    return prisma.courseQuotaSeats.findUnique({
      where: {
        uq_cycle_course_quota: { admissionCycleCourseId, collegeQuotaId },
      },
      select: SELECT,
    });
  }

  static async create(data: {
    admissionCycleCourseId: string;
    collegeQuotaId: string;
    totalSeats: number;
  }) {
    return prisma.courseQuotaSeats.create({
      data: {
        admissionCycleCourseId: data.admissionCycleCourseId,
        collegeQuotaId: data.collegeQuotaId,
        totalSeats: data.totalSeats,
        openSeats: data.totalSeats,
      },
      select: SELECT,
    });
  }

  static async reactivateExclusive(id: string, totalSeats: number) {
    return prisma.courseQuotaSeats.update({
      where: { id },
      data: {
        isActive: true,
        seatPoolId: null,
        totalSeats,
        openSeats: totalSeats,
      },
      select: SELECT,
    });
  }

  static async update(
    admissionCycleCourseId: string,
    id: string,
    data: { totalSeats?: number; isActive?: boolean },
  ) {
    const existing = await prisma.courseQuotaSeats.findFirst({
      where: { id, admissionCycleCourseId },
      select: { id: true },
    });
    if (!existing) return null;

    return prisma.courseQuotaSeats.update({
      where: { id },
      data: {
        ...(data.totalSeats !== undefined && {
          totalSeats: data.totalSeats,
          openSeats: data.totalSeats,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: SELECT,
    });
  }

  static async softDeleteById(admissionCycleCourseId: string, id: string) {
    const existing = await prisma.courseQuotaSeats.findFirst({
      where: { id, admissionCycleCourseId },
      select: { id: true },
    });
    if (!existing) return null;

    return prisma.courseQuotaSeats.update({
      where: { id },
      data: { isActive: false },
      select: SELECT,
    });
  }
}
