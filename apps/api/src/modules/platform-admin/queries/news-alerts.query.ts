import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import {
  ListNewsAlertsQuery,
  PublicListNewsAlertsQuery,
} from "../validators/news-alerts.validator";

const NEWS_ALERT_LIST_SELECT = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  coverImageUrl: true,
  category: true,
  tags: true,
  source: true,
  collegeId: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const NEWS_ALERT_DETAIL_SELECT = {
  ...NEWS_ALERT_LIST_SELECT,
  content: true,
  publishedBy: true,
} as const;

export class NewsAlertQuery {
  static async listAll(filters: ListNewsAlertsQuery) {
    const { page, limit, status, category, search } = filters;
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...(search
        ? { title: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.newsAlert.findMany({
        where,
        select: NEWS_ALERT_LIST_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.newsAlert.count({ where }),
    ]);

    return { data, meta: PaginationHelper.createMeta(total, page, limit) };
  }

  static async getById(id: string) {
    const newsAlert = await prisma.newsAlert.findUnique({
      where: { id },
      select: NEWS_ALERT_DETAIL_SELECT,
    });
    if (!newsAlert) throw new NotFoundError("News alert not found");
    return newsAlert;
  }

  static async listPublished(filters: PublicListNewsAlertsQuery) {
    const { page, limit, category, search } = filters;
    const skip = (page - 1) * limit;

    const where = {
      status: "published",
      ...(category ? { category } : {}),
      ...(search
        ? { title: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.newsAlert.findMany({
        where,
        select: NEWS_ALERT_LIST_SELECT,
        orderBy: [{ publishedAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.newsAlert.count({ where }),
    ]);

    return { data, meta: PaginationHelper.createMeta(total, page, limit) };
  }

  static async getPublishedBySlug(slug: string) {
    const newsAlert = await prisma.newsAlert.findUnique({
      where: { slug },
      select: NEWS_ALERT_DETAIL_SELECT,
    });
    if (!newsAlert || newsAlert.status !== "published")
      throw new NotFoundError("News alert not found");
    return newsAlert;
  }
}
