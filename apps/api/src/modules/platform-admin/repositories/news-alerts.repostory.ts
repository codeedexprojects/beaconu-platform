import { prisma } from "@beaconu/db";

const NEWS_ALERT_SELECT = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  content: true,
  coverImageUrl: true,
  category: true,
  tags: true,
  source: true,
  collegeId: true,
  status: true,
  publishedAt: true,
  publishedBy: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class NewsAlertsRepository {
  static async findAll() {
    return prisma.newsAlert.findMany();
  }

  static async findById(id: string) {
    return prisma.newsAlert.findUnique({
      where: { id },
      select: NEWS_ALERT_SELECT,
    });
  }

  static async findBySlug(slug: string) {
    return prisma.newsAlert.findUnique({
      where: { slug },
      select: NEWS_ALERT_SELECT,
    });
  }

  static async create(data: {
    title: string;
    slug: string;
    summary?: string | null;
    content: string;
    coverImageUrl?: string | null;
    category: string;
    tags?: string[];
    source?: string | null;
    collegeId?: string | null;
    status: string;
    publishedAt?: Date | null;
    publishedBy?: string | null;
  }) {
    return prisma.newsAlert.create({ data, select: NEWS_ALERT_SELECT });
  }

  static async updateById(
    id: string,
    data: {
      title?: string;
      slug?: string;
      summary?: string | null;
      content?: string;
      coverImageUrl?: string | null;
      category?: string;
      tags?: string[];
      source?: string | null;
      status?: string;
      publishedAt?: Date | null;
      publishedBy?: string | null;
    },
  ) {
    return prisma.newsAlert.update({
      where: { id },
      data,
      select: NEWS_ALERT_SELECT,
    });
  }

  static async softDeleteById(id: string) {
    return prisma.newsAlert.update({
      where: { id },
      data: { status: "archived" },
      select: NEWS_ALERT_SELECT,
    });
  }
}
