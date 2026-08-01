import type { Prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { AttemptRepository } from "../repositories/attempt.repository";
import { AnswerRepository } from "../repositories/answer.repository";
import { PaperRepository } from "../repositories/paper.repository";
import { TemplateRepository } from "../repositories/template.repository";
import { ApplicationCourseService } from "@/modules/admissions/services/application-course.service";
import type { EvaluationQueueItem, ScoreOverrideInput } from "@beaconu/types";

export class EvaluationService {
  static async listQueue(
    collegeId: string,
    filters: { status?: string[] } = {},
  ): Promise<EvaluationQueueItem[]> {
    const attempts = await AttemptRepository.findByCollege(collegeId, {
      status: filters.status ?? [
        "in_progress",
        "under_evaluation",
        "evaluated",
        "result_published",
      ],
    });

    return attempts.map((a) => {
      const counts = { pending: 0, auto_scored: 0, evaluated: 0 };
      for (const ans of a.studentAnswers) {
        const key = ans.evaluationStatus as keyof typeof counts;
        if (key in counts) counts[key]++;
      }
      return {
        id: a.id,
        applicationId: a.applicationId,
        studentId: a.studentId,
        studentName: a.student.fullName,
        studentEmail: a.student.email,
        status: a.status as EvaluationQueueItem["status"],
        completedAt: a.completedAt ? a.completedAt.toISOString() : null,
        pendingCount: counts.pending,
        autoScoredCount: counts.auto_scored,
        evaluatedCount: counts.evaluated,
        totalScore: a.totalScore != null ? Number(a.totalScore) : null,
        maxScore: a.maxScore != null ? Number(a.maxScore) : null,
      };
    });
  }

  static async scoreAnswer(
    collegeId: string,
    staffId: string,
    answerId: string,
    data: ScoreOverrideInput,
  ) {
    const answer = await AnswerRepository.findById(answerId);
    if (!answer || answer.attempt.paper.template.collegeId !== collegeId) {
      throw new NotFoundError("Answer not found");
    }
    if (answer.attempt.status !== "under_evaluation") {
      throw new ConflictError("This attempt is not currently under evaluation");
    }

    return AnswerRepository.updateScore(answerId, {
      manualScore: data.manual_score,
      finalScore: data.manual_score,
      evaluatedBy: staffId,
      evaluationRemarks: data.remarks,
    });
  }

  static async publish(collegeId: string, staffId: string, attemptId: string) {
    const attempt = await AttemptRepository.findById(attemptId);
    if (!attempt || attempt.paper.template.collegeId !== collegeId) {
      throw new NotFoundError("Assessment attempt not found");
    }
    if (attempt.status !== "under_evaluation") {
      throw new ConflictError(
        `Attempt is "${attempt.status}", not ready to publish`,
      );
    }

    const answers = await AnswerRepository.listByAttempt(attemptId);
    const pendingCount = answers.filter(
      (a) => a.evaluationStatus === "pending",
    ).length;
    if (pendingCount > 0) {
      throw new ConflictError(
        `${pendingCount} answer(s) still need manual scoring before publishing`,
      );
    }

    const paper = await PaperRepository.findById(attempt.paperId);
    if (!paper) throw new NotFoundError("Assessment paper not found");

    const template = await TemplateRepository.findById(
      attempt.paper.templateId,
    );
    if (!template) throw new NotFoundError("Assessment template not found");

    const answerByQuestion = new Map(answers.map((a) => [a.questionId, a]));
    const sectionRaw: Record<string, { score: number; max: number }> = {};
    let rawTotal = 0;
    let rawMax = 0;

    for (const pq of paper.paperQuestions) {
      const marks = Number(pq.question.marks);
      if (!sectionRaw[pq.sectionId]) {
        sectionRaw[pq.sectionId] = { score: 0, max: 0 };
      }
      sectionRaw[pq.sectionId]!.max += marks;
      rawMax += marks;

      const answer = answerByQuestion.get(pq.questionId);
      const score = answer
        ? Number(answer.finalScore ?? answer.autoScore ?? 0)
        : 0;
      sectionRaw[pq.sectionId]!.score += score;
      rawTotal += score;
    }

    const weightageBySection = new Map(
      template.templateSections
        .filter((ts) => ts.sectionWeightage != null)
        .map((ts) => [ts.sectionId, Number(ts.sectionWeightage)]),
    );
    const allWeighted =
      weightageBySection.size === template.templateSections.length &&
      template.templateSections.length > 0;

    let totalScore = rawTotal;
    let maxScore = rawMax;
    if (allWeighted) {
      totalScore = 0;
      maxScore = 100;
      for (const [sectionId, weight] of weightageBySection) {
        const raw = sectionRaw[sectionId];
        if (!raw || raw.max === 0) continue;
        totalScore += (raw.score / raw.max) * weight;
      }
    }

    await AttemptRepository.update(attemptId, {
      totalScore,
      maxScore,
      sectionScores: sectionRaw as unknown as Prisma.InputJsonValue,
      status: "evaluated",
    });
    await AttemptRepository.update(attemptId, { status: "result_published" });

    // Fan-out: one attempt covers every course on the Application, so every
    // active ApplicationCourse under it gets marked, not just one.
    await ApplicationCourseService.markAssessmentCompletedForApplication(
      attempt.applicationId,
      staffId,
    );

    return AttemptRepository.findById(attemptId);
  }
}
