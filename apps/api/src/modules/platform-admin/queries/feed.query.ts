import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { ListFeedQuery } from "../validators/feed.validator";

const FEED_FULL_SELECT = {
  id: true,
  caption: true,
  thumbnailUrl: true,
  videoUrl: true,
  displayOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class FeedQuery {
  static async listAll(filters: ListFeedQuery) {
    const { page, limit, is_active } = filters;
    const skip = (page - 1) * limit;
    const where = is_active !== undefined ? { isActive: is_active } : {};

    const [data, total] = await prisma.$transaction([
      prisma.feed.findMany({
        where,
        select: FEED_FULL_SELECT,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.feed.count({ where }),
    ]);

    return {
      data,
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }

  static async getById(id: string) {
    const feed = await prisma.feed.findUnique({
      where: { id },
      select: FEED_FULL_SELECT,
    });
    if (!feed) throw new NotFoundError("Feed item not found");
    return feed;
  }

  /** Public-facing feed: paginated, active only. */
  static async listActive(filters: ListFeedQuery) {
    const { page, limit } = filters;
    const skip = (page - 1) * limit;
    const where = { isActive: true };

    const [data, total] = await prisma.$transaction([
      prisma.feed.findMany({
        where,
        select: FEED_FULL_SELECT,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.feed.count({ where }),
    ]);

    return {
      data,
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }
}
