import { prisma } from "@beaconu/db";

const SELECT = {
  id: true,
  title: true,
  date: true,
  link: true,
  highlighted: true,
  isActive: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class SiteAnnouncementRepository {
  static async findByCollegeId(collegeId: string, activeOnly = false) {
    return prisma.siteAnnouncement.findMany({
      where: { collegeId, ...(activeOnly && { isActive: true }) },
      select: SELECT,
      orderBy: [{ sortOrder: "asc" }, { date: "desc" }],
    });
  }

  static async findById(id: string, collegeId: string) {
    return prisma.siteAnnouncement.findFirst({
      where: { id, collegeId },
      select: SELECT,
    });
  }

  static async countByCollegeId(collegeId: string) {
    return prisma.siteAnnouncement.count({ where: { collegeId } });
  }

  static async create(data: {
    collegeId: string;
    title: string;
    date: Date;
    link: string | null;
    highlighted: boolean;
    sortOrder: number;
  }) {
    return prisma.siteAnnouncement.create({ data, select: SELECT });
  }

  static async update(
    id: string,
    collegeId: string,
    data: {
      title?: string;
      date?: Date;
      link?: string | null;
      highlighted?: boolean;
      isActive?: boolean;
    },
  ) {
    const existing = await prisma.siteAnnouncement.findFirst({
      where: { id, collegeId },
    });
    if (!existing) return null;

    return prisma.siteAnnouncement.update({
      where: { id },
      data,
      select: SELECT,
    });
  }

  static async softDeleteById(id: string, collegeId: string) {
    const existing = await prisma.siteAnnouncement.findFirst({
      where: { id, collegeId },
    });
    if (!existing) return null;

    return prisma.siteAnnouncement.update({
      where: { id },
      data: { isActive: false },
      select: SELECT,
    });
  }

  static async reorder(collegeId: string, orderedIds: string[]): Promise<void> {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.siteAnnouncement.updateMany({
          where: { id, collegeId },
          data: { sortOrder: index },
        }),
      ),
    );
  }

  static async findPublicByCollegeSlug(collegeSlug: string) {
    return prisma.siteAnnouncement.findMany({
      where: {
        isActive: true,
        college: { slug: collegeSlug, status: "active" },
      },
      select: SELECT,
      orderBy: [{ sortOrder: "asc" }, { date: "desc" }],
    });
  }
}
