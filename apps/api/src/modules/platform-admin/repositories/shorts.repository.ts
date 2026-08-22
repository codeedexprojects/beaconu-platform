import { prisma } from "@beaconu/db";

const SHORT_SELECT = {
  id: true,
  title: true,
  thumbnailUrl: true,
  videoUrl: true,
  displayOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class ShortsRepository {
  static async findById(id: string) {
    return prisma.short.findUnique({
      where: { id },
      select: SHORT_SELECT,
    });
  }

  static async create(data: {
    title: string;
    thumbnailUrl: string;
    videoUrl: string;
    displayOrder: number;
  }) {
    return prisma.short.create({ data, select: SHORT_SELECT });
  }

  static async updateById(
    id: string,
    data: {
      title?: string;
      thumbnailUrl?: string;
      videoUrl?: string;
      displayOrder?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.short.update({
      where: { id },
      data,
      select: SHORT_SELECT,
    });
  }

  static async softDeactivateById(id: string) {
    return prisma.short.update({
      where: { id },
      data: { isActive: false },
      select: SHORT_SELECT,
    });
  }
}
