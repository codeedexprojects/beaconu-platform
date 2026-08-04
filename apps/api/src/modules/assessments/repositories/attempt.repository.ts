import { prisma, Prisma } from "@beaconu/db";

export class AttemptRepository {
  static async findApplicationForAttempt(applicationId: string) {
    return prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        studentId: true,
        collegeId: true,
        formStatus: true,
        admissionCycle: {
          select: { assessmentTemplateId: true, assessmentRequired: true },
        },
      },
    });
  }

  static async findByStudentAndApplication(
    applicationId: string,
    studentId: string,
  ) {
    return prisma.assessmentAttempt.findUnique({
      where: {
        uq_student_attempt: { applicationId, studentId },
      },
    });
  }

  static async create(data: {
    applicationId: string;
    studentId: string;
    paperId: string;
    slotId: string;
    status: string;
    startedAt: Date;
    lastActivityAt: Date;
  }) {
    return prisma.assessmentAttempt.create({ data });
  }

  static async findById(id: string) {
    return prisma.assessmentAttempt.findUnique({
      where: { id },
      include: {
        paper: {
          select: {
            id: true,
            templateId: true,
            template: {
              select: { id: true, collegeId: true },
            },
          },
        },
        slot: { select: { windowEnd: true, status: true } },
      },
    });
  }

  static async delete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.assessmentAttempt.delete({ where: { id } });
  }

  static async deleteReschedulesByAttempt(
    attemptId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? prisma;
    return client.assessmentReschedule.deleteMany({ where: { attemptId } });
  }

  static async findPaperQuestion(paperId: string, questionId: string) {
    return prisma.paperQuestion.findFirst({
      where: { paperId, questionId },
      include: { question: { include: { questionType: true } } },
    });
  }

  static async update(
    id: string,
    data: Prisma.AssessmentAttemptUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? prisma;
    return client.assessmentAttempt.update({ where: { id }, data });
  }

  static async appendAntiCheatEvent(
    id: string,
    event: { type: string; at: string },
  ) {
    const current = await prisma.assessmentAttempt.findUnique({
      where: { id },
      select: { antiCheatLog: true },
    });
    const log = Array.isArray(current?.antiCheatLog)
      ? (current!.antiCheatLog as unknown[])
      : [];
    return prisma.assessmentAttempt.update({
      where: { id },
      data: {
        antiCheatLog: [...log, event] as unknown as Prisma.InputJsonValue,
        lastActivityAt: new Date(),
      },
    });
  }

  static async listInProgressForAutoSubmit() {
    return prisma.assessmentAttempt.findMany({
      where: { status: "in_progress" },
      include: {
        paper: {
          include: {
            template: {
              select: {
                templateSections: { select: { timeLimitMins: true } },
              },
            },
          },
        },
        slot: { select: { windowEnd: true } },
      },
    });
  }

  static async findTemplateSections(templateId: string) {
    return prisma.templateSection.findMany({
      where: { templateId },
      include: {
        section: { select: { id: true, name: true, description: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async findQuestionsForSection(paperId: string, sectionId: string) {
    return prisma.paperQuestion.findMany({
      where: { paperId, sectionId },
      include: { question: { include: { questionType: true } } },
      orderBy: { questionOrder: "asc" },
    });
  }

  static async findByCollege(
    collegeId: string,
    filters: { status?: string[] },
  ) {
    return prisma.assessmentAttempt.findMany({
      where: {
        paper: { template: { collegeId } },
        ...(filters.status && { status: { in: filters.status } }),
      },
      include: {
        student: { select: { fullName: true, email: true } },
        studentAnswers: { select: { evaluationStatus: true } },
      },
      orderBy: { completedAt: "desc" },
    });
  }

  static async findByIdForEvaluation(id: string) {
    return prisma.assessmentAttempt.findUnique({
      where: { id },
      include: {
        student: { select: { fullName: true, email: true } },
        paper: {
          select: { id: true, template: { select: { collegeId: true } } },
        },
      },
    });
  }
}
