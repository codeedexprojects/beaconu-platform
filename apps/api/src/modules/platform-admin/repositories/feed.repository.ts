import { prisma } from "@beaconu/db";

const FEED_SELECT = {
  id: true,
  caption: true,
  thumbnailUrl: true,
  videoUrl: true,
  displayOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class FeedRepository {
  static async findById(id: string) {
    return prisma.feed.findUnique({
      where: { id },
      select: FEED_SELECT,
    });
  }

  static async create(data: {
    caption: string;
    thumbnailUrl: string;
    videoUrl: string;
    displayOrder: number;
  }) {
    return prisma.feed.create({ data, select: FEED_SELECT });
  }

  static async updateById(
    id: string,
    data: {
      caption?: string;
      thumbnailUrl?: string;
      videoUrl?: string;
      displayOrder?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.feed.update({
      where: { id },
      data,
      select: FEED_SELECT,
    });
  }

  static async softDeactivateById(id: string) {
    return prisma.feed.update({
      where: { id },
      data: { isActive: false },
      select: FEED_SELECT,
    });
  }
}
