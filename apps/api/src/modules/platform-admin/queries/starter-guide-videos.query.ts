import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { permanentUrl } from "@/shared/lib/s3";
import { ListStarterGuideVideosQuery } from "../validators/starter-guide-videos.validator";

const SGV_SELECT = {
  id: true,
  title: true,
  videoKey: true,
  displayOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

function withUrl<T extends { videoKey: string }>(video: T) {
  return { ...video, videoUrl: permanentUrl(video.videoKey) };
}

export class StarterGuideVideoQuery {
  static async listAll(filters: ListStarterGuideVideosQuery) {
    const { page, limit, is_active } = filters;
    const skip = (page - 1) * limit;
    const where = is_active !== undefined ? { isActive: is_active } : {};

    const [data, total] = await prisma.$transaction([
      prisma.starterGuideVideo.findMany({
        where,
        select: SGV_SELECT,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.starterGuideVideo.count({ where }),
    ]);

    return {
      data: data.map(withUrl),
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }

  static async getById(id: string) {
    const video = await prisma.starterGuideVideo.findUnique({
      where: { id },
      select: SGV_SELECT,
    });
    if (!video) throw new NotFoundError("Starter guide video not found");
    return withUrl(video);
  }

  static async listActive(filters: ListStarterGuideVideosQuery) {
    const { page, limit } = filters;
    const skip = (page - 1) * limit;
    const where = { isActive: true };

    const [data, total] = await prisma.$transaction([
      prisma.starterGuideVideo.findMany({
        where,
        select: SGV_SELECT,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.starterGuideVideo.count({ where }),
    ]);

    return {
      data: data.map(withUrl),
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }

  static async getActiveById(id: string) {
    const video = await prisma.starterGuideVideo.findUnique({
      where: { id, isActive: true },
      select: SGV_SELECT,
    });
    if (!video) throw new NotFoundError("Starter guide video not found");
    return withUrl(video);
  }
}
