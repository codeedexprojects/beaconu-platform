import { prisma } from "@beaconu/db";

const ICON_SELECT = {
  id: true,
  name: true,
  iconUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class IconsRepository {
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
      prisma.icon.findMany({
        where,
        select: ICON_SELECT,
        orderBy: { name: "asc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.icon.count({ where }),
    ]);

    return { rows, total };
  }

  /** Active icons only, optionally name-filtered — for the college-admin
   * icon picker. Unpaginated: the icon library is small reference data,
   * same reasoning as EducationBoardsRepository.listActiveNames. */
  static async listActive(search?: string) {
    return prisma.icon.findMany({
      where: {
        isActive: true,
        ...(search
          ? { name: { contains: search, mode: "insensitive" as const } }
          : {}),
      },
      select: ICON_SELECT,
      orderBy: { name: "asc" },
    });
  }

  static async findById(id: string) {
    return prisma.icon.findUnique({ where: { id }, select: ICON_SELECT });
  }

  static async findByName(name: string) {
    return prisma.icon.findUnique({ where: { name }, select: ICON_SELECT });
  }

  static async create(data: { name: string; iconUrl: string }) {
    return prisma.icon.create({ data, select: ICON_SELECT });
  }

  static async update(
    id: string,
    data: { name?: string; iconUrl?: string; isActive?: boolean },
  ) {
    return prisma.icon.update({ where: { id }, data, select: ICON_SELECT });
  }
}
