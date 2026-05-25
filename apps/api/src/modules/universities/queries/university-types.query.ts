import { prisma } from "@beaconu/db";
import { PublicListQuery } from "../validators/academic-taxonomy.validator";

const UNIVERSITY_TYPE_SELECT = {
  id: true,
  name: true,
  slug: true,
  sortOrder: true,
} as const;

export class UniversityTypeQuery {
  static async listActive(filters: PublicListQuery) {
    const whereClause: any = { isActive: true };

    if (filters.search) {
      whereClause.name = { contains: filters.search, mode: "insensitive" };
    }

    if (filters.university_id) {
      whereClause.universities = {
        some: {
          id: filters.university_id,
          status: "active",
        },
      };
    }

    const [data, total] = await Promise.all([
      prisma.universityType.findMany({
        where: whereClause,
        select: UNIVERSITY_TYPE_SELECT,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.universityType.count({ where: whereClause }),
    ]);

    return {
      data,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }
}
