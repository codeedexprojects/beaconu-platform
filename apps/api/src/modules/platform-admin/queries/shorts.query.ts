import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { ListShortsQuery } from "../validators/shorts.validator";

const SHORT_FULL_SELECT = {
  id: true,
  title: true,
  thumbnailUrl: true,
  videoUrl: true,
  displayOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class ShortsQuery {
  static async listAll(filters: ListShortsQuery) {
    const { page, limit, is_active } = filters;
    const skip = (page - 1) * limit;
    const where = is_active !== undefined ? { isActive: is_active } : {};

    const [data, total] = await prisma.$transaction([
      prisma.short.findMany({
        where,
        select: SHORT_FULL_SELECT,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.short.count({ where }),
    ]);

    return {
      data,
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }

  static async getById(id: string) {
    const short = await prisma.short.findUnique({
      where: { id },
      select: SHORT_FULL_SELECT,
    });
    if (!short) throw new NotFoundError("Short not found");
    return short;
  }

  /** Student-facing feed: paginated, active only. */
  static async listActive(filters: ListShortsQuery) {
    const { page, limit } = filters;
    const skip = (page - 1) * limit;
    const where = { isActive: true };

    const [data, total] = await prisma.$transaction([
      prisma.short.findMany({
        where,
        select: SHORT_FULL_SELECT,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.short.count({ where }),
    ]);

    return {
      data,
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }
}
