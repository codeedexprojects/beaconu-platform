import { NotFoundError } from "@/shared/errors";
import { PaperRepository } from "../repositories/paper.repository";
import type {
  AnswerKey,
  AssessmentPaperItem,
  PaperGenerationType,
  PaperStatus,
  QuestionContent,
  QuestionItem,
} from "@beaconu/types";

type PaperWithQuestions = NonNullable<
  Awaited<ReturnType<typeof PaperRepository.findById>>
>;

function mapPaper(row: PaperWithQuestions): AssessmentPaperItem {
  return {
    id: row.id,
    templateId: row.templateId,
    paperCode: row.paperCode,
    name: row.name,
    generationType: row.generationType as PaperGenerationType,
    status: row.status as PaperStatus,
    generatedBy: row.generatedBy,
    approvedBy: row.approvedBy,
    approvedAt: row.approvedAt ? row.approvedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    questions: row.paperQuestions.map((pq) => {
      const q = pq.question;
      const question: QuestionItem = {
        id: q.id,
        sectionId: q.sectionId,
        questionTypeId: q.questionTypeId,
        difficulty: q.difficulty as QuestionItem["difficulty"],
        title: q.title,
        content: q.content as QuestionContent,
        answerKey: (q.answerKey as AnswerKey | null) ?? null,
        marks: Number(q.marks),
        negativeMarks: Number(q.negativeMarks),
        version: q.version,
        status: q.status as QuestionItem["status"],
        courseIds: [],
        createdAt: q.createdAt.toISOString(),
      };
      return {
        id: pq.id,
        questionId: pq.questionId,
        sectionId: pq.sectionId,
        sectionName: pq.section.name,
        questionOrder: pq.questionOrder,
        question,
      };
    }),
  };
}

export class PaperPreviewQuery {
  static async getById(
    collegeId: string,
    id: string,
  ): Promise<AssessmentPaperItem> {
    const row = await PaperRepository.findById(id);
    if (!row || row.template.collegeId !== collegeId) {
      throw new NotFoundError("Assessment paper not found");
    }
    return mapPaper(row);
  }

  static async listByTemplate(
    collegeId: string,
    templateId: string,
  ): Promise<AssessmentPaperItem[]> {
    const rows = await PaperRepository.listByTemplate(templateId);
    return rows
      .filter((row) => row.template.collegeId === collegeId)
      .map(mapPaper);
  }
}
