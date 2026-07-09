import { prisma } from "@beaconu/db";

export interface PaperQuestionCreateData {
  questionId: string;
  sectionId: string;
  questionOrder: number;
}

export class PaperRepository {
  static async create(
    templateId: string,
    data: {
      paperCode: string;
      generationType: string;
      generatedBy?: string;
      questions: PaperQuestionCreateData[];
    },
  ) {
    return prisma.$transaction(async (tx) => {
      const paper = await tx.assessmentPaper.create({
        data: {
          templateId,
          paperCode: data.paperCode,
          generationType: data.generationType,
          status: "draft",
          generatedBy: data.generatedBy ?? null,
        },
      });

      await tx.paperQuestion.createMany({
        data: data.questions.map((q) => ({
          paperId: paper.id,
          questionId: q.questionId,
          sectionId: q.sectionId,
          questionOrder: q.questionOrder,
        })),
      });

      return paper;
    });
  }

  static async findByCode(paperCode: string) {
    return prisma.assessmentPaper.findUnique({ where: { paperCode } });
  }

  static async findById(id: string) {
    return prisma.assessmentPaper.findUnique({
      where: { id },
      include: {
        template: { select: { collegeId: true } },
        paperQuestions: {
          include: {
            question: true,
            section: { select: { name: true } },
          },
          orderBy: { questionOrder: "asc" },
        },
      },
    });
  }

  static async listByTemplate(templateId: string) {
    return prisma.assessmentPaper.findMany({
      where: { templateId, status: { not: "deleted" } },
      include: {
        template: { select: { collegeId: true } },
        paperQuestions: {
          include: {
            question: true,
            section: { select: { name: true } },
          },
          orderBy: { questionOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async approve(id: string, templateId: string, approvedBy: string) {
    return prisma.$transaction(async (tx) => {
      await tx.assessmentPaper.updateMany({
        where: { templateId, status: "approved", id: { not: id } },
        data: { status: "draft", approvedBy: null, approvedAt: null },
      });

      return tx.assessmentPaper.update({
        where: { id },
        data: { status: "approved", approvedBy, approvedAt: new Date() },
      });
    });
  }

  static async findUsedQuestionIds(templateId: string): Promise<string[]> {
    const rows = await prisma.paperQuestion.findMany({
      where: { paper: { templateId, status: { not: "deleted" } } },
      select: { questionId: true },
      distinct: ["questionId"],
    });
    return rows.map((r) => r.questionId);
  }

  static async softDelete(id: string) {
    return prisma.assessmentPaper.update({
      where: { id },
      data: { status: "deleted" },
    });
  }
}
