import { prisma, Prisma } from "@beaconu/db";

export class AnswerRepository {
  static async upsert(
    attemptId: string,
    questionId: string,
    sectionId: string,
    data: {
      response?: Prisma.InputJsonValue;
      isFlagged?: boolean;
      timeSpentSecs?: number;
      autoScore?: number | null;
      finalScore?: number | null;
      evaluationStatus?: string;
    },
  ) {
    return prisma.studentAnswer.upsert({
      where: { uq_attempt_question: { attemptId, questionId } },
      create: {
        attemptId,
        questionId,
        sectionId,
        response: data.response ?? undefined,
        isFlagged: data.isFlagged ?? false,
        timeSpentSecs: data.timeSpentSecs ?? 0,
        autoScore: data.autoScore ?? undefined,
        finalScore: data.finalScore ?? undefined,
        evaluationStatus: data.evaluationStatus ?? undefined,
        answeredAt: new Date(),
      },
      update: {
        response: data.response ?? undefined,
        isFlagged: data.isFlagged ?? undefined,
        timeSpentSecs: data.timeSpentSecs ?? undefined,
        autoScore: data.autoScore ?? undefined,
        finalScore: data.finalScore ?? undefined,
        evaluationStatus: data.evaluationStatus ?? undefined,
        answeredAt: new Date(),
      },
    });
  }

  static async listAnsweredQuestionIds(attemptId: string) {
    const rows = await prisma.studentAnswer.findMany({
      where: { attemptId },
      select: { questionId: true },
    });
    return new Set(rows.map((r) => r.questionId));
  }

  /** `answeredAt` stays null to distinguish from a real empty submission. */
  static async createManyUnansweredAsWrong(
    rows: { attemptId: string; questionId: string; sectionId: string }[],
  ) {
    if (rows.length === 0) return { count: 0 };
    return prisma.studentAnswer.createMany({
      data: rows.map((row) => ({
        attemptId: row.attemptId,
        questionId: row.questionId,
        sectionId: row.sectionId,
        isFlagged: false,
        timeSpentSecs: 0,
        autoScore: 0,
        finalScore: 0,
        evaluationStatus: "auto_scored",
      })),
      skipDuplicates: true,
    });
  }

  static async listByAttempt(attemptId: string) {
    return prisma.studentAnswer.findMany({
      where: { attemptId },
      include: {
        question: { select: { marks: true, negativeMarks: true } },
      },
    });
  }

  static async findById(id: string) {
    return prisma.studentAnswer.findUnique({
      where: { id },
      include: {
        attempt: {
          include: {
            paper: { include: { template: { select: { collegeId: true } } } },
          },
        },
      },
    });
  }

  static async updateScore(
    id: string,
    data: {
      manualScore: number;
      finalScore: number;
      evaluatedBy: string;
      evaluationRemarks?: string;
    },
  ) {
    return prisma.studentAnswer.update({
      where: { id },
      data: {
        manualScore: data.manualScore,
        finalScore: data.finalScore,
        evaluatedBy: data.evaluatedBy,
        evaluationRemarks: data.evaluationRemarks ?? null,
        evaluationStatus: "evaluated",
      },
    });
  }
}
