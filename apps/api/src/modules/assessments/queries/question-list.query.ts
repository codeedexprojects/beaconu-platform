import { NotFoundError } from "@/shared/errors";
import { SectionRepository } from "../repositories/section.repository";
import { QuestionRepository } from "../repositories/question.repository";
import { QuestionTypeRepository } from "../repositories/question-type.repository";
import { SECTION_SEEDS } from "../constants/section-seeds";
import type {
  AnswerKey,
  PaginationMeta,
  QuestionContent,
  QuestionItem,
} from "@beaconu/types";

function mapQuestion(row: {
  id: string;
  sectionId: string;
  questionTypeId: string;
  difficulty: string;
  title: string | null;
  content: unknown;
  answerKey: unknown;
  marks: unknown;
  negativeMarks: unknown;
  timeLimitSecs: number;
  version: number;
  status: string;
  createdAt: Date;
  courseMappings: { courseId: string }[];
}): QuestionItem {
  return {
    id: row.id,
    sectionId: row.sectionId,
    questionTypeId: row.questionTypeId,
    difficulty: row.difficulty as QuestionItem["difficulty"],
    title: row.title,
    content: row.content as QuestionContent,
    answerKey: (row.answerKey as AnswerKey | null) ?? null,
    marks: Number(row.marks),
    negativeMarks: Number(row.negativeMarks),
    timeLimitSecs: row.timeLimitSecs,
    version: row.version,
    status: row.status as QuestionItem["status"],
    courseIds: row.courseMappings.map((m) => m.courseId),
    createdAt: row.createdAt.toISOString(),
  };
}

export class QuestionListQuery {
  static async listQuestionTypes(collegeId: string, sectionSlug: string) {
    const seedEntry = SECTION_SEEDS[sectionSlug];
    if (!seedEntry) throw new NotFoundError("Assessment section not found");

    return QuestionTypeRepository.listByCollegeAndSlugs(
      collegeId,
      seedEntry.questionTypeSlugs,
    );
  }

  static async listQuestions(
    collegeId: string,
    sectionSlug: string,
    filters: {
      question_type_id?: string;
      difficulty?: string;
      status?: string;
      course_id?: string;
      page: number;
      limit: number;
    },
  ): Promise<{ questions: QuestionItem[]; meta: PaginationMeta }> {
    const section = await SectionRepository.findByCollegeAndSlug(
      collegeId,
      sectionSlug,
    );
    if (!section) throw new NotFoundError("Assessment section not found");

    const { page, limit } = filters;
    const skip = (page - 1) * limit;
    const [rows, total] = await QuestionRepository.listBySection(
      collegeId,
      section.id,
      filters,
      { skip, take: limit },
    );

    return {
      questions: rows.map(mapQuestion),
      meta: { total, page, limit, hasNext: skip + rows.length < total },
    };
  }
}
