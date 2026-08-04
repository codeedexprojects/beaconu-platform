import { prisma } from "@beaconu/db";

const POOL_SELECT = {
  id: true,
  collegeQuotaId: true,
  admissionCycleId: true,
  totalSeats: true,
  openSeats: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  collegeQuota: {
    select: { id: true, name: true, slug: true, bucketType: true },
  },
  courseQuotas: {
    where: { isActive: true },
    select: {
      id: true,
      admissionCycleCourse: {
        select: { course: { select: { id: true, name: true, code: true } } },
      },
    },
  },
} as const;

type PoolCourse = {
  admissionCycleCourseId: string;
  existingSeatRowId?: string;
};

export class SeatPoolRepository {
  static async findCycleInCollege(admissionCycleId: string, collegeId: string) {
    return prisma.admissionCycle.findFirst({
      where: { id: admissionCycleId, collegeId },
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

  static async findActiveCycleCourses(
    admissionCycleId: string,
    courseIds: string[],
  ) {
    return prisma.admissionCycleCourse.findMany({
      where: { admissionCycleId, courseId: { in: courseIds }, isActive: true },
      select: { id: true, courseId: true },
    });
  }

  static async findCourseQuotaSeatsFor(
    collegeQuotaId: string,
    admissionCycleCourseIds: string[],
  ) {
    return prisma.courseQuotaSeats.findMany({
      where: {
        collegeQuotaId,
        admissionCycleCourseId: { in: admissionCycleCourseIds },
      },
      select: {
        id: true,
        admissionCycleCourseId: true,
        isActive: true,
        seatPoolId: true,
      },
    });
  }

  static async findByCycleId(admissionCycleId: string) {
    return prisma.seatPool.findMany({
      where: { admissionCycleId },
      select: POOL_SELECT,
      orderBy: { createdAt: "asc" },
    });
  }

  static async findById(admissionCycleId: string, id: string) {
    return prisma.seatPool.findFirst({
      where: { id, admissionCycleId },
      select: POOL_SELECT,
    });
  }

  static async create(data: {
    collegeQuotaId: string;
    admissionCycleId: string;
    totalSeats: number;
    courses: PoolCourse[];
  }) {
    return prisma.$transaction(async (tx) => {
      const pool = await tx.seatPool.create({
        data: {
          collegeQuotaId: data.collegeQuotaId,
          admissionCycleId: data.admissionCycleId,
          totalSeats: data.totalSeats,
          openSeats: data.totalSeats,
        },
        select: { id: true },
      });

      for (const course of data.courses) {
        if (course.existingSeatRowId) {
          await tx.courseQuotaSeats.update({
            where: { id: course.existingSeatRowId },
            data: {
              isActive: true,
              seatPoolId: pool.id,
              totalSeats: null,
              openSeats: null,
            },
          });
        } else {
          await tx.courseQuotaSeats.create({
            data: {
              admissionCycleCourseId: course.admissionCycleCourseId,
              collegeQuotaId: data.collegeQuotaId,
              seatPoolId: pool.id,
            },
          });
        }
      }

      return tx.seatPool.findUniqueOrThrow({
        where: { id: pool.id },
        select: POOL_SELECT,
      });
    });
  }

  static async update(
    admissionCycleId: string,
    id: string,
    data: {
      collegeQuotaId: string;
      totalSeats?: number;
      isActive?: boolean;
      courses?: PoolCourse[];
    },
  ) {
    const existing = await prisma.seatPool.findFirst({
      where: { id, admissionCycleId },
      select: { id: true },
    });
    if (!existing) return null;

    return prisma.$transaction(async (tx) => {
      if (data.courses) {
        await tx.courseQuotaSeats.updateMany({
          where: { seatPoolId: id },
          data: { isActive: false, seatPoolId: null },
        });
        for (const course of data.courses) {
          if (course.existingSeatRowId) {
            await tx.courseQuotaSeats.update({
              where: { id: course.existingSeatRowId },
              data: {
                isActive: true,
                seatPoolId: id,
                totalSeats: null,
                openSeats: null,
              },
            });
          } else {
            await tx.courseQuotaSeats.create({
              data: {
                admissionCycleCourseId: course.admissionCycleCourseId,
                collegeQuotaId: data.collegeQuotaId,
                seatPoolId: id,
              },
            });
          }
        }
      }

      await tx.seatPool.update({
        where: { id },
        data: {
          ...(data.totalSeats !== undefined && {
            totalSeats: data.totalSeats,
            openSeats: data.totalSeats,
          }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });

      return tx.seatPool.findUniqueOrThrow({
        where: { id },
        select: POOL_SELECT,
      });
    });
  }

  static async softDeleteById(admissionCycleId: string, id: string) {
    const existing = await prisma.seatPool.findFirst({
      where: { id, admissionCycleId },
      select: { id: true },
    });
    if (!existing) return null;

    return prisma.$transaction(async (tx) => {
      await tx.courseQuotaSeats.updateMany({
        where: { seatPoolId: id },
        data: { isActive: false, seatPoolId: null },
      });
      await tx.seatPool.update({ where: { id }, data: { isActive: false } });
      return tx.seatPool.findUniqueOrThrow({
        where: { id },
        select: POOL_SELECT,
      });
    });
  }
}
