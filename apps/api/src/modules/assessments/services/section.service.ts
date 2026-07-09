import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { SectionRepository } from "../repositories/section.repository";
import { QuestionTypeRepository } from "../repositories/question-type.repository";
import { SECTION_SEEDS } from "../constants/section-seeds";

export class SectionService {
  static async listSections(collegeId: string) {
    return SectionRepository.listByCollege(collegeId);
  }

  static async toggleSection(
    collegeId: string,
    slug: string,
    isActive: boolean,
  ) {
    const seed = SECTION_SEEDS[slug];
    if (!seed) throw new NotFoundError("Unknown assessment section");

    let section = await SectionRepository.findByCollegeAndSlug(collegeId, slug);

    if (!section) {
      if (!isActive) {
        throw new NotFoundError("Assessment section not found");
      }
      section = await this.seedSection(collegeId, slug);
      return section;
    }

    return SectionRepository.setActive(section.id, isActive);
  }

  private static async seedSection(collegeId: string, slug: string) {
    const seedEntry = SECTION_SEEDS[slug];

    return prisma.$transaction(async (tx) => {
      const section = await SectionRepository.create(
        collegeId,
        {
          name: seedEntry.section.name,
          slug: seedEntry.section.slug,
          description: seedEntry.section.description,
          isCoreSection: seedEntry.section.isCoreSection,
        },
        tx,
      );

      for (const typeSeed of seedEntry.questionTypes) {
        const existing = await tx.questionType.findFirst({
          where: { collegeId, slug: typeSeed.slug },
        });
        if (!existing) {
          await QuestionTypeRepository.create(collegeId, typeSeed, tx);
        }
      }

      return section;
    });
  }
}
