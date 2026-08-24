import { ConflictError, NotFoundError } from "@/shared/errors";
import { AttemptRepository } from "../repositories/attempt.repository";
import { AnswerRepository } from "../repositories/answer.repository";
import { SlotRepository } from "../repositories/slot.repository";
import { PaperRepository } from "../repositories/paper.repository";
import { TemplateRepository } from "../repositories/template.repository";
import { scoreAutoAnswer } from "../lib/scoring";
import { computeTemplateDurationSecs } from "../lib/duration";
import type {
  AnswerKey,
  AntiCheatEventType,
  AttemptStatus,
  NegativeMarkingMode,
  StartAttemptInput,
  SubmitAnswerInput,
} from "@beaconu/types";
import { prisma } from "@beaconu/db";
import type { Prisma } from "@beaconu/db";

const TAB_HIDDEN_GRACE_MS = 10 * 1000;

export class AttemptService {
  static async start(studentId: string, data: StartAttemptInput) {
    const application = await AttemptRepository.findApplicationForAttempt(
      data.application_id,
    );
    if (!application || application.studentId !== studentId) {
      throw new NotFoundError("Application not found");
    }
    if (application.formStatus !== "submitted") {
      throw new ConflictError(
        "This application is not currently at the assessment stage",
      );
    }

    if (!application.admissionCycle.assessmentRequired) {
      throw new ConflictError("Assessment not required for this application");
    }

    const templateId = application.admissionCycle.assessmentTemplateId;
    if (!templateId) {
      throw new ConflictError(
        "No assessment configured for this admission cycle",
      );
    }

    const slot = await SlotRepository.findCurrentActiveForTemplate(templateId);
    if (!slot) {
      throw new ConflictError("No assessment slot currently scheduled");
    }

    const paper = await PaperRepository.findActiveByTemplateAndType(
      slot.templateId,
      "normal",
    );
    if (!paper) {
      throw new ConflictError(
        "No approved paper available for this assessment yet",
      );
    }

    const existing = await AttemptRepository.findByStudentAndApplication(
      data.application_id,
      studentId,
    );
    if (existing) {
      throw new ConflictError(
        "You already have an attempt for this application",
      );
    }

    const now = new Date();
    return AttemptRepository.create({
      applicationId: data.application_id,
      studentId,
      paperId: paper.id,
      slotId: slot.id,
      status: "in_progress",
      startedAt: now,
      lastActivityAt: now,
    });
  }

  static async restart(collegeId: string, attemptId: string) {
    const attempt = await AttemptRepository.findById(attemptId);
    if (!attempt || attempt.paper.template.collegeId !== collegeId) {
      throw new NotFoundError("Assessment attempt not found");
    }

    await prisma.$transaction(async (tx) => {
      await AttemptRepository.deleteReschedulesByAttempt(attemptId, tx);
      await AttemptRepository.delete(attemptId, tx);
    });

    return { applicationId: attempt.applicationId };
  }

  private static async loadOwn(studentId: string, attemptId: string) {
    const attempt = await AttemptRepository.findById(attemptId);
    if (!attempt || attempt.studentId !== studentId) {
      throw new NotFoundError("Assessment attempt not found");
    }
    return attempt;
  }

  static async getMine(studentId: string, attemptId: string) {
    return this.loadOwn(studentId, attemptId);
  }

  static async findStatusForApplication(
    studentId: string,
    applicationId: string,
  ) {
    const attempt = await AttemptRepository.findByStudentAndApplication(
      applicationId,
      studentId,
    );
    if (!attempt) return null;
    return {
      status: attempt.status as AttemptStatus,
      attemptId: attempt.id,
      startedAt: attempt.startedAt ? attempt.startedAt.toISOString() : null,
      completedAt: attempt.completedAt
        ? attempt.completedAt.toISOString()
        : null,
      totalScore: attempt.totalScore ? Number(attempt.totalScore) : null,
      maxScore: attempt.maxScore ? Number(attempt.maxScore) : null,
    };
  }

  static async saveAnswer(
    studentId: string,
    attemptId: string,
    questionId: string,
    data: SubmitAnswerInput,
  ) {
    const attempt = await this.loadOwn(studentId, attemptId);
    if (attempt.status !== "in_progress") {
      throw new ConflictError("This attempt is not in progress");
    }

    const paperQuestion = await AttemptRepository.findPaperQuestion(
      attempt.paperId,
      questionId,
    );
    if (!paperQuestion) {
      throw new NotFoundError("Question does not belong to this paper");
    }

    const questionType = paperQuestion.question.questionType;
    let autoScore: number | null = null;
    let evaluationStatus: string | undefined;

    if (data.response !== undefined) {
      if (questionType.autoScorable) {
        const template = await TemplateRepository.findById(
          attempt.paper.templateId,
        );
        const settings = (template?.settings ?? {}) as {
          negativeMarkingMode?: NegativeMarkingMode;
        };
        autoScore = scoreAutoAnswer({
          autoScorable: true,
          responseFormat: questionType.responseFormat,
          answerKey: paperQuestion.question.answerKey as AnswerKey | null,
          response: data.response,
          marks: Number(paperQuestion.question.marks),
          negativeMarks: Number(paperQuestion.question.negativeMarks),
          negativeMarkingMode: settings.negativeMarkingMode ?? "none",
        });
        evaluationStatus = "auto_scored";
      } else {
        evaluationStatus = "pending";
      }
    }

    await AnswerRepository.upsert(
      attemptId,
      questionId,
      paperQuestion.sectionId,
      {
        response: data.response as unknown as Prisma.InputJsonValue | undefined,
        isFlagged: data.is_flagged,
        timeSpentSecs: data.time_spent_secs,
        autoScore,
        finalScore: autoScore,
        evaluationStatus,
      },
    );

    return AttemptRepository.update(attemptId, {
      lastActivityAt: new Date(),
    });
  }

  static async recordAntiCheatEvent(
    studentId: string,
    attemptId: string,
    type: AntiCheatEventType,
  ) {
    const attempt = await this.loadOwn(studentId, attemptId);
    if (attempt.status !== "in_progress") {
      throw new ConflictError("This attempt is not in progress");
    }
    return AttemptRepository.appendAntiCheatEvent(attemptId, {
      type,
      at: new Date().toISOString(),
    });
  }

  static async submit(studentId: string, attemptId: string) {
    const attempt = await this.loadOwn(studentId, attemptId);
    if (attempt.status !== "in_progress") {
      throw new ConflictError("This attempt is not in progress");
    }
    return this.finalize(attempt.id, attempt.startedAt, "completed");
  }

  /** Unanswered autoScorable questions are scored 0 ("wrong"), no negative marking. */
  private static async markUnansweredAsWrong(
    attemptId: string,
    paperId: string,
  ) {
    const [paperQuestions, answeredQuestionIds] = await Promise.all([
      AttemptRepository.findAllPaperQuestions(paperId),
      AnswerRepository.listAnsweredQuestionIds(attemptId),
    ]);

    const unanswered = paperQuestions.filter(
      (pq) =>
        pq.question.questionType.autoScorable &&
        !answeredQuestionIds.has(pq.questionId),
    );

    await AnswerRepository.createManyUnansweredAsWrong(
      unanswered.map((pq) => ({
        attemptId,
        questionId: pq.questionId,
        sectionId: pq.sectionId,
      })),
    );
  }

  private static async finalize(
    attemptId: string,
    startedAt: Date | null,
    terminalStatus: Extract<
      AttemptStatus,
      "completed" | "auto_submitted" | "terminated"
    >,
  ) {
    const now = new Date();
    const timeSpentSecs = startedAt
      ? Math.floor((now.getTime() - startedAt.getTime()) / 1000)
      : 0;

    const attempt = await AttemptRepository.update(attemptId, {
      status: terminalStatus,
      completedAt: now,
      timeSpentSecs,
    });

    await this.markUnansweredAsWrong(attemptId, attempt.paperId);

    return AttemptRepository.update(attemptId, {
      status: "under_evaluation",
    });
  }

  static async runAutoSubmitSweep(): Promise<{
    terminated: number;
    autoSubmitted: number;
  }> {
    const attempts = await AttemptRepository.listInProgressForAutoSubmit();
    const now = Date.now();
    let terminated = 0;
    let autoSubmitted = 0;

    for (const attempt of attempts) {
      const log = Array.isArray(attempt.antiCheatLog)
        ? (attempt.antiCheatLog as { type: string; at: string }[])
        : [];
      const lastEvent = log[log.length - 1];

      if (
        lastEvent?.type === "tab_hidden" &&
        now - new Date(lastEvent.at).getTime() > TAB_HIDDEN_GRACE_MS
      ) {
        await this.finalize(attempt.id, attempt.startedAt, "terminated");
        terminated++;
        continue;
      }

      const durationMs =
        computeTemplateDurationSecs(attempt.paper.template.templateSections) *
        1000;
      const isDurationExpired =
        attempt.startedAt && now - attempt.startedAt.getTime() > durationMs;
      const isWindowExpired = now > attempt.slot.windowEnd.getTime();

      if (isDurationExpired || isWindowExpired) {
        await this.finalize(attempt.id, attempt.startedAt, "auto_submitted");
        autoSubmitted++;
      }
    }

    return { terminated, autoSubmitted };
  }
}
