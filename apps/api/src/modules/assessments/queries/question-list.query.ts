import { NotFoundError } from "@/shared/errors";
import { SectionRepository } from "../repositories/section.repository";
import { QuestionRepository } from "../repositories/question.repository";
import { QuestionTypeRepository } from "../repositories/question-type.repository";
import { SECTION_SEEDS } from "../constants/section-seeds";
import type { AnswerKey, QuestionContent, QuestionItem } from "@beaconu/types";

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

    const slugs = seedEntry.questionTypes.map((t) => t.slug);
    return QuestionTypeRepository.listByCollegeAndSlugs(collegeId, slugs);
  }

  static async listQuestions(
    collegeId: string,
    sectionSlug: string,
    filters: {
      question_type_id?: string;
      difficulty?: string;
      status?: string;
      course_id?: string;
    },
  ): Promise<QuestionItem[]> {
    const section = await SectionRepository.findByCollegeAndSlug(
      collegeId,
      sectionSlug,
    );
    if (!section) throw new NotFoundError("Assessment section not found");

    const rows = await QuestionRepository.listBySection(
      collegeId,
      section.id,
      filters,
    );
    return rows.map(mapQuestion);
  }
}
