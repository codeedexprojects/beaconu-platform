import { prisma } from "@beaconu/db";
import type { Prisma } from "@beaconu/db";

const SELECT = {
  id: true,
  title: true,
  content: true,
  category: true,
  isPinned: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const DETAIL_SELECT = {
  ...SELECT,
  requiredDocuments: true,
  attachments: true,
} as const;

function buildWhere(
  collegeId: string,
  filters: { status?: string; category?: string; search?: string },
) {
  return {
    collegeId,
    ...(filters.status && { status: filters.status }),
    ...(filters.category && { category: filters.category }),
    ...(filters.search && {
      OR: [
        { title: { contains: filters.search, mode: "insensitive" as const } },
        {
          content: { contains: filters.search, mode: "insensitive" as const },
        },
      ],
    }),
  };
}

export class NoticeRepository {
  static async list(
    collegeId: string,
    filters: { status?: string; category?: string; search?: string },
    pagination: { page: number; limit: number },
  ) {
    const where = buildWhere(collegeId, filters);
    const [rows, total] = await prisma.$transaction([
      prisma.announcement.findMany({
        where,
        select: SELECT,
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.announcement.count({ where }),
    ]);
    return { rows, total };
  }

  static async findById(id: string, collegeId: string) {
    return prisma.announcement.findFirst({
      where: { id, collegeId },
      select: DETAIL_SELECT,
    });
  }

  static async create(data: {
    collegeId: string;
    title: string;
    content: string;
    category: string;
    isPinned: boolean;
    requiredDocuments: unknown[];
    attachments: unknown[];
    createdBy: string;
  }) {
    return prisma.announcement.create({
      data: {
        collegeId: data.collegeId,
        title: data.title,
        content: data.content,
        category: data.category,
        isPinned: data.isPinned,
        requiredDocuments: data.requiredDocuments as Prisma.InputJsonValue[],
        attachments: data.attachments as Prisma.InputJsonValue[],
        createdBy: data.createdBy,
        status: "published",
        publishedAt: new Date(),
      },
      select: DETAIL_SELECT,
    });
  }

  static async update(
    id: string,
    data: {
      title?: string;
      content?: string;
      category?: string;
      isPinned?: boolean;
      requiredDocuments?: unknown[];
      attachments?: unknown[];
    },
  ) {
    return prisma.announcement.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
        ...(data.requiredDocuments !== undefined && {
          requiredDocuments: data.requiredDocuments as Prisma.InputJsonValue[],
        }),
        ...(data.attachments !== undefined && {
          attachments: data.attachments as Prisma.InputJsonValue[],
        }),
      },
      select: DETAIL_SELECT,
    });
  }

  static async setStatus(id: string, status: "published" | "archived") {
    return prisma.announcement.update({
      where: { id },
      data: { status },
      select: DETAIL_SELECT,
    });
  }
}
