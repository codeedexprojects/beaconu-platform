import { prisma } from "@beaconu/db";
import type { Prisma } from "@beaconu/db";

const BLOG_SELECT = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  content: true,
  coverImageUrl: true,
  tags: true,
  authorId: true,
  authorType: true,
  authorName: true,
  status: true,
  rejectionReason: true,
  reviewedBy: true,
  reviewedAt: true,
  publishedAt: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class BlogRepository {
  static async findById(id: string) {
    return prisma.blog.findUnique({
      where: { id },
      select: BLOG_SELECT,
    });
  }

  static async findBySlug(slug: string) {
    return prisma.blog.findUnique({
      where: { slug },
      select: BLOG_SELECT,
    });
  }

  static async create(data: {
    title: string;
    slug: string;
    summary?: string | null;
    content: string;
    coverImageUrl?: string | null;
    tags: Prisma.InputJsonValue;
    authorId: string;
    authorType: string;
    authorName: string;
    status: string;
    publishedAt: Date | null;
  }) {
    return prisma.blog.create({
      data,
      select: BLOG_SELECT,
    });
  }

  static async updateById(
    id: string,
    data: {
      title?: string;
      slug?: string;
      summary?: string | null;
      content?: string;
      coverImageUrl?: string | null;
      tags?: Prisma.InputJsonValue;
      status?: string;
      rejectionReason?: string | null;
      reviewedBy?: string | null;
      reviewedAt?: Date | null;
      publishedAt?: Date | null;
    },
  ) {
    return prisma.blog.update({
      where: { id },
      data,
      select: BLOG_SELECT,
    });
  }

  static async incrementViewCount(id: string): Promise<void> {
    await prisma.blog.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }
}
