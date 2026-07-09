import { randomUUID } from "crypto";
import { logger } from "@/shared/lib/logger";
import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors";
import { TemplateRepository } from "../repositories/template.repository";
import { PaperRepository } from "../repositories/paper.repository";
import { QuestionRepository } from "../repositories/question.repository";
import type { GeneratePaperInput } from "@beaconu/types";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generatePaperCode(): string {
  return `PAPER-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export class PaperGenerationService {
  private static async loadActiveTemplate(
    collegeId: string,
    templateId: string,
  ) {
    const template = await TemplateRepository.findById(templateId);
    if (!template || template.collegeId !== collegeId) {
      throw new NotFoundError("Assessment template not found");
    }
    if (template.status !== "active") {
      throw new ConflictError(
        "Activate the template before generating a paper",
      );
    }
    return template;
  }

  static async generate(
    collegeId: string,
    userId: string,
    templateId: string,
    data: GeneratePaperInput,
  ) {
    const template = await this.loadActiveTemplate(collegeId, templateId);

    const hasCalculatorSection = template.templateSections.some(
      (ts) => !ts.section.isCoreSection,
    );
    if (hasCalculatorSection && !data.course_id) {
      throw new ValidationError(
        "course_id is required — this template includes a course-specific section",
      );
    }

    const questions =
      data.generation_type === "manual"
        ? await this.assembleManual(collegeId, template, data)
        : await this.assembleAuto(collegeId, template, data.course_id);

    let paperCode = generatePaperCode();
    if (await PaperRepository.findByCode(paperCode)) {
      paperCode = generatePaperCode();
    }

    return PaperRepository.create(templateId, {
      paperCode,
      generationType: data.generation_type,
      generatedBy: userId,
      questions,
    });
  }

  private static async assembleAuto(
    collegeId: string,
    template: NonNullable<
      Awaited<ReturnType<typeof TemplateRepository.findById>>
    >,
    courseId: string | undefined,
  ) {
    const usedIds = await PaperRepository.findUsedQuestionIds(template.id);
    let order = 0;
    const result: {
      questionId: string;
      sectionId: string;
      questionOrder: number;
    }[] = [];

    for (const ts of template.templateSections) {
      const courseFilter = ts.section.isCoreSection ? undefined : courseId;

      let pool = await QuestionRepository.listActivePoolForSection(
        collegeId,
        ts.sectionId,
        courseFilter,
        usedIds,
      );

      if (pool.length < ts.questionCount) {
        logger.warn({
          action: "PAPER_GENERATION_REUSE_FALLBACK",
          module: "assessments",
          sectionId: ts.sectionId,
          templateId: template.id,
        });
        pool = await QuestionRepository.listActivePoolForSection(
          collegeId,
          ts.sectionId,
          courseFilter,
        );
      }

      if (pool.length < ts.questionCount) {
        throw new ConflictError(
          `Not enough active questions in section "${ts.section.name}" to generate this paper (need ${ts.questionCount}, have ${pool.length})`,
        );
      }

      const picked = shuffle(pool).slice(0, ts.questionCount);
      for (const q of picked) {
        result.push({
          questionId: q.id,
          sectionId: ts.sectionId,
          questionOrder: order++,
        });
      }
    }

    return result;
  }

  private static async assembleManual(
    collegeId: string,
    template: NonNullable<
      Awaited<ReturnType<typeof TemplateRepository.findById>>
    >,
    data: GeneratePaperInput,
  ) {
    const selections = data.manual_selections ?? [];
    if (selections.length === 0) {
      throw new ValidationError(
        "manual_selections is required for manual generation",
      );
    }

    for (const ts of template.templateSections) {
      const countForSection = selections.filter(
        (s) => s.section_id === ts.sectionId,
      ).length;
      if (countForSection !== ts.questionCount) {
        throw new ValidationError(
          `Section "${ts.section.name}" needs exactly ${ts.questionCount} questions, got ${countForSection}`,
        );
      }
    }

    const questionIds = selections.map((s) => s.question_id);
    const questions = await QuestionRepository.findByIds(
      collegeId,
      questionIds,
    );
    const questionsById = new Map(questions.map((q) => [q.id, q]));

    return selections.map((s, index) => {
      const question = questionsById.get(s.question_id);
      if (!question) {
        throw new NotFoundError(`Question "${s.question_id}" not found`);
      }
      if (question.sectionId !== s.section_id) {
        throw new ValidationError(
          `Question "${s.question_id}" does not belong to section "${s.section_id}"`,
        );
      }
      return {
        questionId: s.question_id,
        sectionId: s.section_id,
        questionOrder: index,
      };
    });
  }

  static async approve(collegeId: string, userId: string, paperId: string) {
    const paper = await PaperRepository.findById(paperId);
    if (!paper || paper.template.collegeId !== collegeId) {
      throw new NotFoundError("Assessment paper not found");
    }
    if (paper.status === "approved") {
      throw new ConflictError("Paper is already approved");
    }
    return PaperRepository.approve(paperId, paper.templateId, userId);
  }

  static async remove(collegeId: string, paperId: string) {
    const paper = await PaperRepository.findById(paperId);
    if (!paper || paper.template.collegeId !== collegeId) {
      throw new NotFoundError("Assessment paper not found");
    }
    if (paper.status === "approved") {
      throw new ConflictError(
        "This paper is currently approved — approve a different paper first, which will demote this one, before deleting it",
      );
    }
    return PaperRepository.softDelete(paperId);
  }
}
