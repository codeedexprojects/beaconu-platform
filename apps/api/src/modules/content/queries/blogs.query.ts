import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import {
  ListBlogsQuery,
  PublicListBlogsQuery,
} from "../validators/blogs.validator";

const BLOG_LIST_SELECT = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  coverImageUrl: true,
  tags: true,
  authorId: true,
  authorType: true,
  authorName: true,
  status: true,
  publishedAt: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
} as const;

const BLOG_DETAIL_SELECT = {
  ...BLOG_LIST_SELECT,
  content: true,
  rejectionReason: true,
  reviewedBy: true,
  reviewedAt: true,
} as const;

export class BlogQuery {
  static async listAll(filters: ListBlogsQuery) {
    const { page, limit, status, search } = filters;
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              {
                authorName: { contains: search, mode: "insensitive" as const },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.blog.findMany({
        where,
        select: BLOG_LIST_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    return { data, meta: PaginationHelper.createMeta(total, page, limit) };
  }

  static async getById(id: string) {
    const blog = await prisma.blog.findUnique({
      where: { id },
      select: BLOG_DETAIL_SELECT,
    });
    if (!blog) throw new NotFoundError("Blog not found");
    return blog;
  }

  static async listByAuthor(authorId: string, filters: ListBlogsQuery) {
    const { page, limit, status } = filters;
    const skip = (page - 1) * limit;

    const where = {
      authorId,
      ...(status ? { status } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.blog.findMany({
        where,
        select: BLOG_LIST_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    return { data, meta: PaginationHelper.createMeta(total, page, limit) };
  }

  static async listPublished(filters: PublicListBlogsQuery) {
    const { page, limit, search } = filters;
    const skip = (page - 1) * limit;

    const where = {
      status: "approved",
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              {
                authorName: { contains: search, mode: "insensitive" as const },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.blog.findMany({
        where,
        select: BLOG_LIST_SELECT,
        orderBy: [{ publishedAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    return { data, meta: PaginationHelper.createMeta(total, page, limit) };
  }
}
