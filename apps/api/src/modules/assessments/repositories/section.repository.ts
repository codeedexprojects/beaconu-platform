import { prisma, Prisma } from "@beaconu/db";

export class SectionRepository {
  static async findByCollegeAndSlug(collegeId: string, slug: string) {
    return prisma.assessmentSection.findFirst({ where: { collegeId, slug } });
  }

  static async findById(id: string) {
    return prisma.assessmentSection.findUnique({ where: { id } });
  }

  static async create(
    collegeId: string,
    data: {
      name: string;
      slug: string;
      description: string;
      isCoreSection: boolean;
    },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? prisma;
    return client.assessmentSection.create({
      data: {
        collegeId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        isCoreSection: data.isCoreSection,
        isActive: true,
      },
    });
  }

  static async setActive(id: string, isActive: boolean) {
    return prisma.assessmentSection.update({
      where: { id },
      data: { isActive },
    });
  }

  static async listByCollege(collegeId: string) {
    return prisma.assessmentSection.findMany({
      where: { collegeId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }
}
