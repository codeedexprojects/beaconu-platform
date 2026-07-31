import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { SectionRepository } from "../repositories/section.repository";
import { QuestionTypeRepository } from "../repositories/question-type.repository";
import { SECTION_SEEDS, QUESTION_TYPE_SEEDS } from "../constants/section-seeds";

export class SectionService {
  static async listSections(collegeId: string) {
    return SectionRepository.listByCollege(collegeId);
  }

  static async toggleSection(
    collegeId: string,
    slug: string,
    isActive: boolean,
  ) {
    const seedEntry = SECTION_SEEDS[slug];
    if (!seedEntry) throw new NotFoundError("Unknown assessment section");

    const section = await SectionRepository.findByCollegeAndSlug(
      collegeId,
      slug,
    );

    if (!section) {
      if (!isActive) {
        throw new NotFoundError("Assessment section not found");
      }
      return this.seedSection(collegeId, slug);
    }

    if (isActive) {
      // Backfills any question types added to this section's seed after the
      // college first enabled it — not just on first creation.
      await this.syncQuestionTypes(collegeId, seedEntry.questionTypeSlugs);
    }

    return SectionRepository.setActive(section.id, isActive);
  }

  private static async syncQuestionTypes(
    collegeId: string,
    questionTypeSlugs: string[],
  ) {
    for (const typeSlug of questionTypeSlugs) {
      const seed = QUESTION_TYPE_SEEDS[typeSlug];
      if (!seed) continue; // Guards against a stale slug left in a section's list.
      const existing = await prisma.questionType.findFirst({
        where: { collegeId, slug: seed.slug },
      });
      if (!existing) {
        await QuestionTypeRepository.create(collegeId, seed);
      }
    }
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

      for (const typeSlug of seedEntry.questionTypeSlugs) {
        const typeSeed = QUESTION_TYPE_SEEDS[typeSlug];
        if (!typeSeed) continue;
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
