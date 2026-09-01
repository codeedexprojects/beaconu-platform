import { NotFoundError } from "@/shared/errors";
import { PaperRepository } from "../repositories/paper.repository";
import { AttemptRepository } from "../repositories/attempt.repository";
import type {
  AttemptSectionQuestionPage,
  AttemptSectionStatus,
  AttemptSectionSummary,
  QuestionContent,
} from "@beaconu/types";

export class TrialService {
  private static async loadActiveTrialPaper(templateId: string) {
    const paper = await PaperRepository.findActiveByTemplateAndType(
      templateId,
      "trial",
    );
    if (!paper) {
      throw new NotFoundError("No active trial paper for this assessment");
    }
    return paper;
  }

  static async getSections(
    templateId: string,
  ): Promise<AttemptSectionSummary[]> {
    await this.loadActiveTrialPaper(templateId);
    const templateSections =
      await AttemptRepository.findTemplateSections(templateId);

    return templateSections.map((ts) => ({
      id: ts.id,
      sectionId: ts.sectionId,
      name: ts.section.name,
      description: ts.section.description,
      isCoreSection: ts.section.isCoreSection,
      questionCount: ts.questionCount,
      timeLimitMins: ts.timeLimitMins,
      // Demo questions are never answered/submitted — these two fields
      // exist only so the response shape matches the real assessment's
      // section-list API exactly, letting the same UI render both.
      answeredCount: 0,
      status: "not_started" as AttemptSectionStatus,
    }));
  }

  static async getSectionQuestions(
    templateId: string,
    sectionId: string,
    questionOrder: number,
  ): Promise<AttemptSectionQuestionPage> {
    const paper = await this.loadActiveTrialPaper(templateId);
    const paperQuestions = await AttemptRepository.findQuestionsForSection(
      paper.id,
      sectionId,
    );

    const target = paperQuestions[questionOrder - 1];
    if (!target) {
      throw new NotFoundError("Question not found");
    }

    return {
      question: {
        id: target.id,
        questionId: target.questionId,
        questionOrder,
        questionTypeId: target.question.questionTypeId,
        questionTypeName: target.question.questionType.name,
        responseFormat: target.question.questionType.responseFormat,
        content: target.question.content as unknown as QuestionContent,
        marks: Number(target.question.marks),
        timeLimitSecs: target.question.timeLimitSecs,
        // No submission exists for a demo — nothing to echo back here.
        myAnswer: null,
      },
      questionOrder,
      totalQuestions: paperQuestions.length,
      hasNext: questionOrder < paperQuestions.length,
      hasPrevious: questionOrder > 1,
    };
  }
}
