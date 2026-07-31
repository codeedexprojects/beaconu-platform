import { prisma, Prisma } from "@beaconu/db";

export class AnswerRepository {
  static async upsert(
    attemptId: string,
    questionId: string,
    sectionId: string,
    data: {
      // Omitted (undefined) means "flag/time-only save" — leave any
      // existing response untouched on update, and store null on create
      // (StudentAnswer.response is nullable) rather than overwriting a
      // real answer with null.
      response?: Prisma.InputJsonValue;
      isFlagged?: boolean;
      timeSpentSecs?: number;
      autoScore?: number | null;
      finalScore?: number | null;
      // Omitted (undefined) on a flag-only save leaves a prior
      // evaluationStatus untouched (e.g. doesn't downgrade an
      // already-auto_scored answer back to "pending"); the column's DB
      // default ("pending") covers a genuinely new row.
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

  /** Hard delete — a college-admin "restart this assessment" action,
   * unlike every other entity in this codebase, genuinely means erase the
   * previous responses so the attempt is blank again. StudentAnswer rows
   * are the literal content of a response being explicitly discarded by
   * an authorized admin action, not a business record with its own
   * lifecycle (no status/isActive column exists on this model), so this
   * is a deliberate exception to the "soft deletes only" rule — confirmed
   * with the user rather than assumed. */
  static async deleteByAttempt(
    attemptId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? prisma;
    return client.studentAnswer.deleteMany({ where: { attemptId } });
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
