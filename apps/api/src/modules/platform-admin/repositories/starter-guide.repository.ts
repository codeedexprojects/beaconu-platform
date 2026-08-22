import { prisma, Prisma } from "@beaconu/db";

const SG_SELECT = {
  id: true,
  title: true,
  description: true,
  thumbnailUrl: true,
  videoUrl: true,
  steps: true,
  displayOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class StarterGuideRepository {
  static async findById(id: string) {
    return prisma.starterGuide.findUnique({
      where: { id },
      select: SG_SELECT,
    });
  }

  static async create(data: {
    title: string;
    description?: string | null;
    thumbnailUrl: string;
    videoUrl: string;
    steps: Prisma.InputJsonValue;
    displayOrder: number;
  }) {
    return prisma.starterGuide.create({ data, select: SG_SELECT });
  }

  static async updateById(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      thumbnailUrl?: string;
      videoUrl?: string;
      steps?: Prisma.InputJsonValue;
      displayOrder?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.starterGuide.update({
      where: { id },
      data,
      select: SG_SELECT,
    });
  }

  static async softDeactivateById(id: string) {
    return prisma.starterGuide.update({
      where: { id },
      data: { isActive: false },
      select: SG_SELECT,
    });
  }
}
