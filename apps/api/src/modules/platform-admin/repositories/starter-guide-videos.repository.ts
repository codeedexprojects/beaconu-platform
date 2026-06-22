import { prisma } from "@beaconu/db";

const SGV_SELECT = {
  id: true,
  title: true,
  videoKey: true,
  displayOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class StarterGuideVideosRepository {
  static async findById(id: string) {
    return prisma.starterGuideVideo.findUnique({
      where: { id },
      select: SGV_SELECT,
    });
  }

  static async create(data: {
    title: string;
    videoKey: string;
    displayOrder: number;
  }) {
    return prisma.starterGuideVideo.create({ data, select: SGV_SELECT });
  }

  static async updateById(
    id: string,
    data: {
      title?: string;
      videoKey?: string;
      displayOrder?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.starterGuideVideo.update({
      where: { id },
      data,
      select: SGV_SELECT,
    });
  }

  static async softDeactivateById(id: string) {
    return prisma.starterGuideVideo.update({
      where: { id },
      data: { isActive: false },
      select: SGV_SELECT,
    });
  }
}
