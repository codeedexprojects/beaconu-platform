import { prisma } from "@beaconu/db";

const ADMIN_SELECT = {
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
  seatMatrixCourses: {
    select: {
      id: true,
      course: { select: { id: true, name: true, code: true } },
    },
  },
} as const;

export class SeatMatrixRepository {
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

  /** Only courses actively attached to this admission cycle may share a
   * seat pool — the pool is meaningless for a course students can't apply
   * to through this application form. */
  static async findActiveCycleCourseIds(
    admissionCycleId: string,
    courseIds: string[],
  ) {
    const rows = await prisma.admissionCycleCourse.findMany({
      where: { admissionCycleId, courseId: { in: courseIds }, isActive: true },
      select: { courseId: true },
    });
    return new Set(rows.map((r) => r.courseId));
  }

  static async findByCycleId(admissionCycleId: string) {
    return prisma.seatMatrix.findMany({
      where: { admissionCycleId },
      select: ADMIN_SELECT,
      orderBy: { createdAt: "asc" },
    });
  }

  /** Includes soft-deleted (isActive: false) rows — used to detect a prior
   * deactivation so re-creating reactivates the existing pool instead of
   * violating the (collegeQuotaId, admissionCycleId) unique constraint. */
  static async findByCycleAndQuota(
    admissionCycleId: string,
    collegeQuotaId: string,
  ) {
    return prisma.seatMatrix.findUnique({
      where: { uq_seat_matrix: { collegeQuotaId, admissionCycleId } },
      select: ADMIN_SELECT,
    });
  }

  static async create(data: {
    collegeQuotaId: string;
    admissionCycleId: string;
    totalSeats: number;
    courseIds: string[];
  }) {
    const created = await prisma.seatMatrix.create({
      data: {
        collegeQuotaId: data.collegeQuotaId,
        admissionCycleId: data.admissionCycleId,
        totalSeats: data.totalSeats,
        openSeats: data.totalSeats,
        seatMatrixCourses: {
          createMany: {
            data: data.courseIds.map((courseId) => ({ courseId })),
          },
        },
      },
      select: { id: true },
    });
    return prisma.seatMatrix.findUniqueOrThrow({
      where: { id: created.id },
      select: ADMIN_SELECT,
    });
  }

  /** Reactivates a previously-deactivated pool and replaces its course
   * assignments atomically (delete + recreate join rows + flip is_active). */
  static async reactivate(
    id: string,
    data: { totalSeats: number; courseIds: string[] },
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.seatMatrixCourse.deleteMany({ where: { seatMatrixId: id } });
      await tx.seatMatrix.update({
        where: { id },
        data: {
          isActive: true,
          totalSeats: data.totalSeats,
          openSeats: data.totalSeats,
          seatMatrixCourses: {
            createMany: {
              data: data.courseIds.map((courseId) => ({ courseId })),
            },
          },
        },
      });
      return tx.seatMatrix.findUniqueOrThrow({
        where: { id },
        select: ADMIN_SELECT,
      });
    });
  }

  static async update(
    admissionCycleId: string,
    id: string,
    data: { totalSeats?: number; courseIds?: string[]; isActive?: boolean },
  ) {
    const existing = await prisma.seatMatrix.findFirst({
      where: { id, admissionCycleId },
      select: { id: true },
    });
    if (!existing) return null;

    const seatFields = {
      ...(data.totalSeats !== undefined && {
        totalSeats: data.totalSeats,
        // No seat-consumption flow exists yet (applications aren't live),
        // so open_seats always tracks total_seats here. Once application
        // submission decrements open_seats, this must instead preserve the
        // already-consumed count: openSeats = data.totalSeats - consumed.
        openSeats: data.totalSeats,
      }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    };

    if (data.courseIds) {
      await prisma.$transaction([
        prisma.seatMatrixCourse.deleteMany({ where: { seatMatrixId: id } }),
        prisma.seatMatrixCourse.createMany({
          data: data.courseIds.map((courseId) => ({
            seatMatrixId: id,
            courseId,
          })),
        }),
        prisma.seatMatrix.update({ where: { id }, data: seatFields }),
      ]);
    } else if (Object.keys(seatFields).length > 0) {
      await prisma.seatMatrix.update({ where: { id }, data: seatFields });
    }

    return prisma.seatMatrix.findUniqueOrThrow({
      where: { id },
      select: ADMIN_SELECT,
    });
  }

  static async softDeleteById(admissionCycleId: string, id: string) {
    const existing = await prisma.seatMatrix.findFirst({
      where: { id, admissionCycleId },
      select: { id: true },
    });
    if (!existing) return null;

    return prisma.seatMatrix.update({
      where: { id },
      data: { isActive: false },
      select: ADMIN_SELECT,
    });
  }
}
