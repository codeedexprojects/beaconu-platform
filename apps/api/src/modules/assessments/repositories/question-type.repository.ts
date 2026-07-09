import { prisma, Prisma } from "@beaconu/db";
import type { QuestionTypeSeed } from "../constants/section-seeds";

export class QuestionTypeRepository {
  static async findByCollegeAndSlug(collegeId: string, slug: string) {
    return prisma.questionType.findFirst({ where: { collegeId, slug } });
  }

  static async create(
    collegeId: string,
    seed: QuestionTypeSeed,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? prisma;
    return client.questionType.create({
      data: {
        collegeId,
        name: seed.name,
        slug: seed.slug,
        category: seed.category,
        responseFormat: seed.responseFormat,
        hasAudio: seed.hasAudio,
        hasImage: seed.hasImage,
        hasPassage: seed.hasPassage,
        autoScorable: seed.autoScorable,
        isSystemType: true,
      },
    });
  }

  static async listByCollegeAndSlugs(collegeId: string, slugs: string[]) {
    return prisma.questionType.findMany({
      where: { collegeId, slug: { in: slugs } },
      orderBy: { sortOrder: "asc" },
    });
  }
}
