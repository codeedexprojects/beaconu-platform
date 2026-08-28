import { prisma } from "@beaconu/db";

const SELECT = {
  id: true,
  mediaType: true,
  url: true,
  caption: true,
  sortOrder: true,
} as const;

export class CollegeGalleryRepository {
  static async findByCollegeId(collegeId: string) {
    return prisma.collegeGallery.findMany({
      where: { collegeId },
      select: SELECT,
      orderBy: { sortOrder: "asc" },
    });
  }

  static async findById(id: string, collegeId: string) {
    return prisma.collegeGallery.findFirst({
      where: { id, collegeId },
      select: SELECT,
    });
  }

  static async countByCollegeId(collegeId: string) {
    return prisma.collegeGallery.count({ where: { collegeId } });
  }

  static async create(data: {
    collegeId: string;
    mediaType: string;
    url: string;
    caption: string | null;
    sortOrder: number;
  }) {
    return prisma.collegeGallery.create({ data, select: SELECT });
  }

  static async delete(id: string, collegeId: string) {
    const item = await prisma.collegeGallery.findFirst({
      where: { id, collegeId },
    });
    if (!item) return null;

    await prisma.collegeGallery.delete({ where: { id } });
    return item;
  }

  static async reorder(collegeId: string, orderedIds: string[]): Promise<void> {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.collegeGallery.updateMany({
          where: { id, collegeId },
          data: { sortOrder: index },
        }),
      ),
    );
  }
}
