import { prisma, Prisma } from "@beaconu/db";

export class CollegeDashboardRepository {
  static async listColleges(filters: {
    search?: string;
    status?: string;
    page: number;
    limit: number;
  }) {
    const { search, status, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          code: true,
          city: true,
          state: true,
          status: true,
          logoUrl: true,
          createdAt: true,
          settings: true,
          university: { select: { id: true, name: true } },
          _count: {
            select: {
              campuses: true,
              courses: true,
              staffMembers: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.college.count({ where }),
    ]);

    return {
      data: colleges.map(({ settings, ...college }) => ({
        ...college,
        isListed: isSettingsListed(settings),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCollegeDetail(id: string) {
    const college = await prisma.college.findUnique({
      where: { id },
      include: {
        university: { select: { id: true, name: true, slug: true } },
        campuses: {
          where: { status: "active" },
          orderBy: [{ isMainCampus: "desc" }, { createdAt: "asc" }],
        },
        courses: {
          where: { status: "active" },
          include: {
            discipline: {
              select: {
                name: true,
                stream: { select: { name: true } },
              },
            },
            studyLevel: { select: { name: true } },
            programType: { select: { name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        staffMembers: {
          include: {
            collegeRole: { select: { name: true, slug: true } },
          },
        },
        collegeOnboardingRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            campuses: true,
            courses: true,
            staffMembers: true,
          },
        },
      },
    });

    if (!college) return null;

    return { ...college, isListed: isSettingsListed(college.settings) };
  }

  static async getSettings(id: string) {
    const college = await prisma.college.findUnique({
      where: { id },
      select: { settings: true },
    });
    return college ? college.settings : null;
  }

  static async updateSettings(id: string, settings: Record<string, unknown>) {
    return prisma.college.update({
      where: { id },
      data: { settings: settings as Prisma.InputJsonValue },
    });
  }

  static async getCollegeStats() {
    const [total, pending, active] = await Promise.all([
      prisma.college.count(),
      prisma.college.count({ where: { status: "pending_setup" } }),
      prisma.college.count({ where: { status: "active" } }),
    ]);
    return { total, pending, active };
  }
}

function isSettingsListed(settings: unknown): boolean {
  if (typeof settings !== "object" || settings === null) return false;
  return (settings as Record<string, unknown>).isListed === true;
}
