import { NotFoundError } from "@/shared/errors";
import { AttemptRepository } from "../repositories/attempt.repository";
import { AnswerRepository } from "../repositories/answer.repository";
import { PaperRepository } from "../repositories/paper.repository";
import type {
  AnswerEvaluationStatus,
  AnswerKey,
  AnswerResponse,
  EvaluationAnswerDetail,
  EvaluationAttemptDetail,
  QuestionContent,
} from "@beaconu/types";

export class EvaluationDetailQuery {
  static async getById(
    collegeId: string,
    attemptId: string,
  ): Promise<EvaluationAttemptDetail> {
    const attempt = await AttemptRepository.findByIdForEvaluation(attemptId);
    if (!attempt || attempt.paper.template.collegeId !== collegeId) {
      throw new NotFoundError("Assessment attempt not found");
    }

    const [paper, answers] = await Promise.all([
      PaperRepository.findById(attempt.paper.id),
      AnswerRepository.listByAttempt(attemptId),
    ]);
    if (!paper) throw new NotFoundError("Assessment paper not found");

    const answerByQuestion = new Map(answers.map((a) => [a.questionId, a]));

    const answerDetails: EvaluationAnswerDetail[] = paper.paperQuestions.map(
      (pq) => {
        const answer = answerByQuestion.get(pq.questionId);
        return {
          id: answer?.id ?? pq.id,
          questionId: pq.questionId,
          sectionId: pq.sectionId,
          sectionName: pq.section.name,
          questionOrder: pq.questionOrder,
          content: pq.question.content as unknown as QuestionContent,
          answerKey: (pq.question.answerKey as AnswerKey | null) ?? null,
          marks: Number(pq.question.marks),
          response:
            (answer?.response as unknown as AnswerResponse | null) ?? null,
          isFlagged: answer?.isFlagged ?? false,
          autoScore:
            answer?.autoScore != null ? Number(answer.autoScore) : null,
          manualScore:
            answer?.manualScore != null ? Number(answer.manualScore) : null,
          finalScore:
            answer?.finalScore != null ? Number(answer.finalScore) : null,
          evaluationStatus: (answer?.evaluationStatus ??
            "pending") as AnswerEvaluationStatus,
          evaluationRemarks: answer?.evaluationRemarks ?? null,
        };
      },
    );

    return {
      id: attempt.id,
      applicationCourseId: attempt.applicationCourseId,
      studentId: attempt.studentId,
      studentName: attempt.student.fullName,
      studentEmail: attempt.student.email,
      status: attempt.status as EvaluationAttemptDetail["status"],
      startedAt: attempt.startedAt ? attempt.startedAt.toISOString() : null,
      completedAt: attempt.completedAt
        ? attempt.completedAt.toISOString()
        : null,
      totalScore:
        attempt.totalScore != null ? Number(attempt.totalScore) : null,
      maxScore: attempt.maxScore != null ? Number(attempt.maxScore) : null,
      answers: answerDetails,
    };
  }
}
