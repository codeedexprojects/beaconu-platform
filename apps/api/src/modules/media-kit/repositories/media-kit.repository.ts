import { prisma } from "@beaconu/db";

export class MediaKitRepository {
  static async courseExistsInCollege(
    courseId: string,
    collegeId: string,
  ): Promise<boolean> {
    const course = await prisma.course.findFirst({
      where: { id: courseId, collegeId },
      select: { id: true },
    });
    return course !== null;
  }

  static async create(
    collegeId: string,
    data: {
      title: string;
      assetType: string;
      scope: string;
      courseId: string | null;
      fileUrl: string;
      fileName: string | null;
      fileSizeBytes: number | null;
      thumbnailUrl: string | null;
      sortOrder: number;
    },
  ) {
    return prisma.mediaKit.create({
      data: {
        collegeId,
        courseId: data.courseId,
        title: data.title,
        assetType: data.assetType,
        scope: data.scope,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSizeBytes: data.fileSizeBytes,
        thumbnailUrl: data.thumbnailUrl,
        sortOrder: data.sortOrder,
      },
      include: { course: { select: { id: true, name: true, code: true } } },
    });
  }

  static async findById(id: string, collegeId: string) {
    return prisma.mediaKit.findFirst({
      where: { id, collegeId },
      include: { course: { select: { id: true, name: true, code: true } } },
    });
  }

  static async update(
    id: string,
    collegeId: string,
    data: {
      title?: string;
      sortOrder?: number;
      isActive?: boolean;
      thumbnailUrl?: string;
    },
  ) {
    const existing = await prisma.mediaKit.findFirst({
      where: { id, collegeId },
    });
    if (!existing) return null;

    return prisma.mediaKit.update({
      where: { id },
      data,
      include: { course: { select: { id: true, name: true, code: true } } },
    });
  }

  static async softDeleteById(id: string, collegeId: string) {
    const existing = await prisma.mediaKit.findFirst({
      where: { id, collegeId },
    });
    if (!existing) return null;

    return prisma.mediaKit.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
