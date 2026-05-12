import { prisma } from "@beaconu/db";

const UNIVERSITY_TYPE_SELECT = {
  id: true,
  name: true,
  slug: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
} as const;

export class UniversityTypeRepository {
  static async listAll(filters: { isActive?: boolean } = {}) {
    return prisma.universityType.findMany({
      where: {
        ...(filters.isActive !== undefined
          ? { isActive: filters.isActive }
          : {}),
      },
      select: UNIVERSITY_TYPE_SELECT,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  static async findById(id: string) {
    return prisma.universityType.findUnique({
      where: { id },
      select: UNIVERSITY_TYPE_SELECT,
    });
  }

  static async findByName(name: string) {
    return prisma.universityType.findUnique({
      where: { name },
      select: UNIVERSITY_TYPE_SELECT,
    });
  }

  static async findBySlug(slug: string) {
    return prisma.universityType.findUnique({
      where: { slug },
      select: UNIVERSITY_TYPE_SELECT,
    });
  }

  static async create(data: {
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
  }) {
    return prisma.universityType.create({
      data,
      select: UNIVERSITY_TYPE_SELECT,
    });
  }

  static async updateById(
    id: string,
    data: {
      name?: string;
      slug?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.universityType.update({
      where: { id },
      data,
      select: UNIVERSITY_TYPE_SELECT,
    });
  }

  static async deleteById(id: string) {
    return prisma.universityType.delete({ where: { id } });
  }
}
