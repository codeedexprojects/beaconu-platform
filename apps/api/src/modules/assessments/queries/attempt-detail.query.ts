import { NotFoundError } from "@/shared/errors";
import { AttemptRepository } from "../repositories/attempt.repository";
import { AnswerRepository } from "../repositories/answer.repository";
import type {
  AnswerResponse,
  AttemptOverview,
  AttemptQuestionItem,
  AttemptSectionQuestionPage,
  AttemptSectionStatus,
  AttemptSectionSummary,
  QuestionContent,
} from "@beaconu/types";

export class AttemptDetailQuery {
  private static async loadOwn(studentId: string, attemptId: string) {
    const attempt = await AttemptRepository.findById(attemptId);
    if (!attempt || attempt.studentId !== studentId) {
      throw new NotFoundError("Assessment attempt not found");
    }
    return attempt;
  }

  static async getSections(
    studentId: string,
    attemptId: string,
  ): Promise<AttemptSectionSummary[]> {
    const attempt = await this.loadOwn(studentId, attemptId);
    const [templateSections, answers] = await Promise.all([
      AttemptRepository.findTemplateSections(attempt.paper.templateId),
      AnswerRepository.listByAttempt(attemptId),
    ]);

    const answeredCountBySection = new Map<string, number>();
    for (const a of answers) {
      if (a.response === null) continue;
      answeredCountBySection.set(
        a.sectionId,
        (answeredCountBySection.get(a.sectionId) ?? 0) + 1,
      );
    }

    return templateSections.map((ts) => {
      const answeredCount = answeredCountBySection.get(ts.sectionId) ?? 0;
      const status: AttemptSectionStatus =
        answeredCount === 0
          ? "not_started"
          : answeredCount >= ts.questionCount
            ? "completed"
            : "in_progress";
      return {
        id: ts.id,
        sectionId: ts.sectionId,
        name: ts.section.name,
        description: ts.section.description,
        isCoreSection: ts.section.isCoreSection,
        questionCount: ts.questionCount,
        timeLimitMins: ts.timeLimitMins,
        answeredCount,
        status,
      };
    });
  }

  private static toAttemptQuestionItem(
    pq: Awaited<
      ReturnType<typeof AttemptRepository.findQuestionsForSection>
    >[number],
    answerByQuestion: Map<
      string,
      Awaited<ReturnType<typeof AnswerRepository.listByAttempt>>[number]
    >,
    displayOrder: number,
  ): AttemptQuestionItem {
    const answer = answerByQuestion.get(pq.questionId);
    return {
      id: pq.id,
      questionId: pq.questionId,
      questionOrder: displayOrder,
      questionTypeId: pq.question.questionTypeId,
      questionTypeName: pq.question.questionType.name,
      responseFormat: pq.question.questionType.responseFormat,
      content: pq.question.content as unknown as QuestionContent,
      marks: Number(pq.question.marks),
      timeLimitSecs: pq.question.timeLimitSecs,
      myAnswer: answer
        ? {
            response:
              (answer.response as unknown as AnswerResponse | null) ?? null,
            isFlagged: answer.isFlagged,
            answeredAt: answer.answeredAt
              ? answer.answeredAt.toISOString()
              : null,
          }
        : null,
    };
  }

  static async getSectionQuestions(
    studentId: string,
    attemptId: string,
    sectionId: string,
    questionOrder: number,
  ): Promise<AttemptSectionQuestionPage> {
    const attempt = await this.loadOwn(studentId, attemptId);
    const [paperQuestions, answers] = await Promise.all([
      AttemptRepository.findQuestionsForSection(attempt.paperId, sectionId),
      AnswerRepository.listByAttempt(attemptId),
    ]);

    const target = paperQuestions[questionOrder - 1];
    if (!target) {
      throw new NotFoundError("Question not found");
    }

    const answerByQuestion = new Map(answers.map((a) => [a.questionId, a]));

    return {
      question: this.toAttemptQuestionItem(
        target,
        answerByQuestion,
        questionOrder,
      ),
      questionOrder,
      totalQuestions: paperQuestions.length,
      hasNext: questionOrder < paperQuestions.length,
      hasPrevious: questionOrder > 1,
    };
  }

  static async getOverview(
    studentId: string,
    attemptId: string,
    sectionId: string,
  ): Promise<AttemptOverview> {
    const attempt = await this.loadOwn(studentId, attemptId);
    const [paperQuestions, answers, templateSections] = await Promise.all([
      AttemptRepository.findQuestionsForSection(attempt.paperId, sectionId),
      AnswerRepository.listByAttempt(attemptId),
      AttemptRepository.findTemplateSections(attempt.paper.templateId),
    ]);

    const sectionName =
      templateSections.find((ts) => ts.sectionId === sectionId)?.section.name ??
      "";
    const answerByQuestion = new Map(answers.map((a) => [a.questionId, a]));

    let answeredCount = 0;
    let flaggedCount = 0;
    const questions = paperQuestions.map((pq, index) => {
      const answer = answerByQuestion.get(pq.questionId);
      const isAnswered = answer ? answer.response !== null : false;
      const isFlagged = answer?.isFlagged ?? false;
      if (isAnswered) answeredCount++;
      if (isFlagged) flaggedCount++;
      return {
        questionOrder: index + 1,
        questionId: pq.questionId,
        isAnswered,
        isFlagged,
      };
    });

    return {
      sectionId,
      sectionName,
      totalQuestions: paperQuestions.length,
      answeredCount,
      flaggedCount,
      questions,
    };
  }
}
