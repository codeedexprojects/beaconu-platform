import { prisma } from "@beaconu/db";

const INI_SELECT = {
  id: true,
  name: true,
  slug: true,
  iconUrl: true,
  collegesCount: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class InstitutesOfNationalImportanceRepository {
  static async listAll(filters: {
    isActive?: boolean;
    search?: string;
    page: number;
    limit: number;
  }) {
    const where = {
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
      ...(filters.search
        ? { name: { contains: filters.search, mode: "insensitive" as const } }
        : {}),
    };

    const [rows, total] = await prisma.$transaction([
      prisma.instituteOfNationalImportance.findMany({
        where,
        select: INI_SELECT,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.instituteOfNationalImportance.count({ where }),
    ]);

    return { rows, total };
  }

  static async findById(id: string) {
    return prisma.instituteOfNationalImportance.findUnique({
      where: { id },
      select: INI_SELECT,
    });
  }

  static async findByName(name: string) {
    return prisma.instituteOfNationalImportance.findUnique({
      where: { name },
      select: INI_SELECT,
    });
  }

  static async findBySlug(slug: string) {
    return prisma.instituteOfNationalImportance.findUnique({
      where: { slug },
      select: INI_SELECT,
    });
  }

  static async create(data: {
    name: string;
    slug: string;
    iconUrl?: string | null;
    collegesCount?: number;
    sortOrder?: number;
  }) {
    return prisma.instituteOfNationalImportance.create({
      data,
      select: INI_SELECT,
    });
  }

  static async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      iconUrl?: string | null;
      collegesCount?: number;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.instituteOfNationalImportance.update({
      where: { id },
      data,
      select: INI_SELECT,
    });
  }
}
