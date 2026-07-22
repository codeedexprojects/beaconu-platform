import { prisma } from "@beaconu/db";

const ADMIN_SELECT = {
  id: true,
  collegeId: true,
  name: true,
  slug: true,
  bucketType: true,
  description: true,
  isActive: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      courseQuotas: { where: { isActive: true } },
      seatPools: { where: { isActive: true } },
    },
  },
} as const;

export class QuotaRepository {
  static async create(data: {
    collegeId: string;
    name: string;
    slug: string;
    bucketType: string;
    description: string | null;
    sortOrder: number;
  }) {
    return prisma.collegeQuota.create({ data, select: ADMIN_SELECT });
  }

  static async findByCollegeId(
    collegeId: string,
    filters: { bucketType?: string; includeInactive?: boolean } = {},
  ) {
    return prisma.collegeQuota.findMany({
      where: {
        collegeId,
        ...(filters.bucketType ? { bucketType: filters.bucketType } : {}),
        ...(filters.includeInactive ? {} : { isActive: true }),
      },
      select: ADMIN_SELECT,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  static async findById(id: string, collegeId: string) {
    return prisma.collegeQuota.findFirst({
      where: { id, collegeId },
      select: ADMIN_SELECT,
    });
  }

  static async findBySlug(collegeId: string, slug: string) {
    return prisma.collegeQuota.findUnique({
      where: { uq_college_quota_slug: { collegeId, slug } },
      select: { id: true },
    });
  }

  static async update(
    id: string,
    collegeId: string,
    data: Record<string, unknown>,
  ) {
    const quota = await prisma.collegeQuota.findFirst({
      where: { id, collegeId },
      select: { id: true },
    });
    if (!quota) return null;

    return prisma.collegeQuota.update({
      where: { id },
      data: data as any,
      select: ADMIN_SELECT,
    });
  }

  static async softDeleteById(id: string, collegeId: string) {
    const quota = await prisma.collegeQuota.findFirst({
      where: { id, collegeId },
      select: { id: true },
    });
    if (!quota) return null;

    return prisma.collegeQuota.update({
      where: { id },
      data: { isActive: false },
      select: ADMIN_SELECT,
    });
  }

  /** Everything currently referencing this quota — which courses have it in
   * their catalogue fee config, and which seat pools (with cycle + course
   * context) allocate seats for it — so an admin can see what to detach
   * before deactivating. */
  static async findUsageById(id: string, collegeId: string) {
    return prisma.collegeQuota.findFirst({
      where: { id, collegeId },
      select: {
        id: true,
        courseQuotas: {
          where: { isActive: true },
          select: {
            id: true,
            course: { select: { id: true, name: true, code: true } },
          },
        },
        seatPools: {
          where: { isActive: true },
          select: {
            id: true,
            totalSeats: true,
            openSeats: true,
            admissionCycle: { select: { id: true, name: true } },
            courseQuotas: {
              where: { isActive: true },
              select: {
                admissionCycleCourse: {
                  select: {
                    course: { select: { id: true, name: true, code: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
