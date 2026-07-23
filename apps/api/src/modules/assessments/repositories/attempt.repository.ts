import { prisma, Prisma } from "@beaconu/db";

export class AttemptRepository {
  /** Reads ApplicationCourse/Application directly (shared tables, not the
   * admissions module's repository) — same cross-module read pattern
   * already used in payments/repositories/application-payment.repository.ts,
   * to avoid a circular module dependency. */
  static async findApplicationCourseForAttempt(applicationCourseId: string) {
    return prisma.applicationCourse.findUnique({
      where: { id: applicationCourseId },
      select: {
        id: true,
        status: true,
        courseId: true,
        application: {
          select: {
            id: true,
            studentId: true,
            collegeId: true,
            admissionCycleId: true,
          },
        },
      },
    });
  }

  static async findAssessmentRequired(
    admissionCycleId: string,
    courseId: string,
  ) {
    return prisma.admissionCycleCourse.findUnique({
      where: { uq_cycle_course: { admissionCycleId, courseId } },
      select: { assessmentRequired: true, isActive: true },
    });
  }

  static async findByStudentAndApplicationCourse(
    applicationCourseId: string,
    studentId: string,
  ) {
    return prisma.assessmentAttempt.findUnique({
      where: {
        uq_student_attempt: { applicationCourseId, studentId },
      },
    });
  }

  static async create(data: {
    applicationCourseId: string;
    studentId: string;
    paperId: string;
    slotId: string;
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

  static async findPaperQuestion(paperId: string, questionId: string) {
    return prisma.paperQuestion.findFirst({
      where: { paperId, questionId },
      include: { question: { include: { questionType: true } } },
    });
  }

  static async update(id: string, data: Prisma.AssessmentAttemptUpdateInput) {
    return prisma.assessmentAttempt.update({ where: { id }, data });
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

  /** Every check the auto-submit job needs, in one pass — the job itself
   * decides which of the three rules (tab-hidden, disconnect, duration
   * expiry) applies per row. */
  static async listInProgressForAutoSubmit() {
    return prisma.assessmentAttempt.findMany({
      where: { status: "in_progress" },
      include: {
        paper: {
          include: {
            paperQuestions: {
              select: { question: { select: { timeLimitSecs: true } } },
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
