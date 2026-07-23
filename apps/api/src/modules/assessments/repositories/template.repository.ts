import { prisma, Prisma } from "@beaconu/db";
import type {
  NegativeMarkingMode,
  TemplateInstructionItem,
  TemplateSectionInput,
} from "@beaconu/types";

export interface TemplateCreateData {
  name: string;
  templateType: string;
  negativeMarkingMode: NegativeMarkingMode;
  instructions?: TemplateInstructionItem[];
  sections: TemplateSectionInput[];
}

export class TemplateRepository {
  static async create(collegeId: string, data: TemplateCreateData) {
    const totalQuestions = data.sections.reduce(
      (sum, s) => sum + s.question_count,
      0,
    );

    return prisma.$transaction(async (tx) => {
      const template = await tx.assessmentTemplate.create({
        data: {
          collegeId,
          name: data.name,
          templateType: data.templateType,
          totalQuestions,
          status: "draft",
          instructions: (data.instructions ??
            []) as unknown as Prisma.InputJsonValue,
          settings: { negativeMarkingMode: data.negativeMarkingMode },
        },
      });

      await tx.templateSection.createMany({
        data: data.sections.map((s, index) => ({
          templateId: template.id,
          sectionId: s.section_id,
          questionCount: s.question_count,
          timeLimitMins: s.time_limit_mins,
          sectionWeightage: s.section_weightage ?? null,
          sortOrder: s.sort_order ?? index,
        })),
      });

      return template;
    });
  }

  static async findById(id: string) {
    return prisma.assessmentTemplate.findUnique({
      where: { id },
      include: {
        templateSections: {
          include: {
            section: {
              select: {
                id: true,
                name: true,
                description: true,
                isCoreSection: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  static async listByCollege(collegeId: string) {
    return prisma.assessmentTemplate.findMany({
      where: { collegeId },
      include: {
        templateSections: {
          include: {
            section: {
              select: {
                id: true,
                name: true,
                description: true,
                isCoreSection: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async update(
    id: string,
    data: Partial<{
      name: string;
      templateType: string;
      negativeMarkingMode: NegativeMarkingMode;
      instructions: TemplateInstructionItem[];
      sections: TemplateSectionInput[];
    }>,
  ) {
    return prisma.$transaction(async (tx) => {
      const updateData: Prisma.AssessmentTemplateUpdateInput = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.templateType !== undefined)
        updateData.templateType = data.templateType;
      if (data.instructions !== undefined)
        updateData.instructions =
          data.instructions as unknown as Prisma.InputJsonValue;
      if (data.negativeMarkingMode !== undefined) {
        updateData.settings = {
          negativeMarkingMode: data.negativeMarkingMode,
        };
      }

      if (data.sections) {
        updateData.totalQuestions = data.sections.reduce(
          (sum, s) => sum + s.question_count,
          0,
        );
        await tx.templateSection.deleteMany({ where: { templateId: id } });
        await tx.templateSection.createMany({
          data: data.sections.map((s, index) => ({
            templateId: id,
            sectionId: s.section_id,
            questionCount: s.question_count,
            timeLimitMins: s.time_limit_mins,
            sectionWeightage: s.section_weightage ?? null,
            sortOrder: s.sort_order ?? index,
          })),
        });
      }

      return tx.assessmentTemplate.update({
        where: { id },
        data: updateData,
      });
    });
  }

  static async setStatus(id: string, status: string) {
    return prisma.assessmentTemplate.update({
      where: { id },
      data: { status },
    });
  }

  static async countSections(id: string) {
    return prisma.templateSection.count({ where: { templateId: id } });
  }
}
