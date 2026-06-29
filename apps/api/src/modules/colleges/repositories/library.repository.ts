import { prisma } from "@beaconu/db";

const ADMIN_SELECT = {
  id: true,
  collegeId: true,
  departmentId: true,
  type: true,
  name: true,
  stats: true,
  availableResources: true,
  libraryHours: true,
  facilities: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  department: { select: { id: true, name: true } },
} as const;

const PUBLIC_SELECT = {
  id: true,
  type: true,
  departmentId: true,
  name: true,
  stats: true,
  availableResources: true,
  libraryHours: true,
  facilities: true,
} as const;

export class LibraryRepository {
  static async create(data: Record<string, unknown>) {
    return prisma.library.create({ data: data as any, select: ADMIN_SELECT });
  }

  static async findByCollegeId(collegeId: string) {
    return prisma.library.findMany({
      where: { collegeId, status: "active" },
      select: ADMIN_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(id: string, collegeId: string) {
    return prisma.library.findFirst({
      where: { id, collegeId },
      select: ADMIN_SELECT,
    });
  }

  static async update(
    id: string,
    collegeId: string,
    data: Record<string, unknown>,
  ) {
    const library = await prisma.library.findFirst({
      where: { id, collegeId },
    });
    if (!library) return null;

    return prisma.library.update({
      where: { id },
      data: data as any,
      select: ADMIN_SELECT,
    });
  }

  static async softDelete(id: string, collegeId: string) {
    const library = await prisma.library.findFirst({
      where: { id, collegeId },
    });
    if (!library) return null;

    return prisma.library.update({
      where: { id },
      data: { status: "inactive" },
      select: ADMIN_SELECT,
    });
  }

  static async findPublicByCollegeAndIds(
    collegeId: string,
    libraryIds: string[],
  ) {
    if (libraryIds.length === 0) return [];

    return prisma.library.findMany({
      where: { collegeId, id: { in: libraryIds }, status: "active" },
      select: PUBLIC_SELECT,
    });
  }

  static async findPublicListByCollegeSlug(collegeSlug: string) {
    return prisma.library.findMany({
      where: {
        status: "active",
        college: { slug: collegeSlug, status: "active" },
      },
      select: PUBLIC_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async findPublicDetailById(collegeSlug: string, libraryId: string) {
    return prisma.library.findFirst({
      where: {
        id: libraryId,
        status: "active",
        college: { slug: collegeSlug, status: "active" },
      },
      select: PUBLIC_SELECT,
    });
  }
}
