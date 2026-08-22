import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { ListStarterGuidesQuery } from "../validators/starter-guide.validator";

const SG_FULL_SELECT = {
  id: true,
  title: true,
  thumbnailUrl: true,
  videoUrl: true,
  steps: true,
  displayOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const SG_LIST_SELECT = {
  id: true,
  title: true,
  thumbnailUrl: true,
  displayOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Public list: title + thumbnail only, per the student-facing card grid. */
const SG_PUBLIC_LIST_SELECT = {
  id: true,
  title: true,
  thumbnailUrl: true,
} as const;

export class StarterGuideQuery {
  static async listAll(filters: ListStarterGuidesQuery) {
    const { page, limit, is_active } = filters;
    const skip = (page - 1) * limit;
    const where = is_active !== undefined ? { isActive: is_active } : {};

    const [data, total] = await prisma.$transaction([
      prisma.starterGuide.findMany({
        where,
        select: SG_LIST_SELECT,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.starterGuide.count({ where }),
    ]);

    return {
      data,
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }

  static async getById(id: string) {
    const guide = await prisma.starterGuide.findUnique({
      where: { id },
      select: SG_FULL_SELECT,
    });
    if (!guide) throw new NotFoundError("Starter guide not found");
    return guide;
  }

  static async listActive(filters: ListStarterGuidesQuery) {
    const { page, limit } = filters;
    const skip = (page - 1) * limit;
    const where = { isActive: true };

    const [data, total] = await prisma.$transaction([
      prisma.starterGuide.findMany({
        where,
        select: SG_PUBLIC_LIST_SELECT,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.starterGuide.count({ where }),
    ]);

    return {
      data,
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }

  static async getActiveById(id: string) {
    const guide = await prisma.starterGuide.findUnique({
      where: { id, isActive: true },
      select: SG_FULL_SELECT,
    });
    if (!guide) throw new NotFoundError("Starter guide not found");
    return guide;
  }
}
