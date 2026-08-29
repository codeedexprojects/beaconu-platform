import { prisma, Prisma } from "@beaconu/db";

const SELECT = {
  id: true,
  applicationCourseId: true,
  studentId: true,
  reason: true,
  supportingDocUrls: true,
  status: true,
  refundAmount: true,
  refundStatus: true,
  processedBy: true,
  remarks: true,
  requestedAt: true,
  processedAt: true,
  currentPhase: true,
  caseType: true,
  scheduledAt: true,
  meetingUrl: true,
  applicationCourse: {
    select: {
      course: { select: { name: true, code: true } },
      application: { select: { collegeId: true } },
    },
  },
} as const;

const DETAIL_SELECT = {
  ...SELECT,
  effectiveDate: true,
  lastSemester: true,
  counselorId: true,
  meetingId: true,
  googleEventId: true,
  counselingCompletedAt: true,
  counselingNotes: true,
  counselingOutcome: true,
  suggestedCaseType: true,
  refundCalculationMethod: true,
  refundCalculationValue: true,
  penaltyAmount: true,
  penaltyPaidAt: true,
  settledAt: true,
  refundTransactionRef: true,
  refundPaymentMethod: true,
  refundProcessedAt: true,
  documentsHandedOverAt: true,
  counselor: { select: { fullName: true, email: true } },
  student: { select: { fullName: true, email: true } },
  phaseLogs: {
    select: {
      id: true,
      phase: true,
      action: true,
      createdAt: true,
      performer: { select: { fullName: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export class SeatCancellationRepository {
  static async countPendingForCollege(collegeId: string) {
    return prisma.seatCancellation.count({
      where: {
        status: "pending",
        applicationCourse: { application: { collegeId } },
      },
    });
  }

  static async findPendingForApplicationCourse(applicationCourseId: string) {
    return prisma.seatCancellation.findFirst({
      where: { applicationCourseId, status: "pending" },
      select: { id: true },
    });
  }

  static async create(data: {
    applicationCourseId: string;
    studentId: string;
    reason: string;
    supportingDocUrls: unknown[];
  }) {
    return prisma.seatCancellation.create({
      data: {
        applicationCourseId: data.applicationCourseId,
        studentId: data.studentId,
        reason: data.reason,
        supportingDocUrls: data.supportingDocUrls as Prisma.InputJsonValue[],
      },
      select: SELECT,
    });
  }

  static async findById(id: string) {
    return prisma.seatCancellation.findUnique({
      where: { id },
      select: SELECT,
    });
  }

  static async findDetailById(id: string) {
    return prisma.seatCancellation.findUnique({
      where: { id },
      select: DETAIL_SELECT,
    });
  }

  static async findStaffInCollege(staffId: string, collegeId: string) {
    return prisma.staffMember.findFirst({
      where: { id: staffId, collegeId },
      select: { id: true, fullName: true, email: true },
    });
  }

  static async findApplicationFee(applicationCourseId: string) {
    return prisma.applicationCourse.findUnique({
      where: { id: applicationCourseId },
      select: { applicationFee: true },
    });
  }

  static async listForStudent(studentId: string) {
    return prisma.seatCancellation.findMany({
      where: { studentId },
      select: SELECT,
      orderBy: { requestedAt: "desc" },
    });
  }

  static async listForCollege(
    collegeId: string,
    filters: { status?: string },
    pagination: { page: number; limit: number },
  ) {
    const where = {
      applicationCourse: { application: { collegeId } },
      ...(filters.status && { status: filters.status }),
    };
    const [rows, total] = await prisma.$transaction([
      prisma.seatCancellation.findMany({
        where,
        select: {
          ...SELECT,
          student: { select: { fullName: true, email: true } },
        },
        orderBy: { requestedAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.seatCancellation.count({ where }),
    ]);
    return { rows, total };
  }

  static async reject(id: string, processedBy: string, remarks: string | null) {
    return prisma.seatCancellation.update({
      where: { id },
      data: {
        status: "rejected",
        processedBy,
        processedAt: new Date(),
        remarks,
      },
      select: SELECT,
    });
  }

  static async approve(
    tx: Prisma.TransactionClient,
    id: string,
    data: {
      processedBy: string;
      remarks: string | null;
      refundAmount: number | null;
      refundStatus: string | null;
    },
  ) {
    return tx.seatCancellation.update({
      where: { id },
      data: {
        status: "approved",
        processedBy: data.processedBy,
        processedAt: new Date(),
        remarks: data.remarks,
        refundAmount: data.refundAmount,
        refundStatus: data.refundStatus,
      },
      select: SELECT,
    });
  }

  // --- Phase-based case flow ---

  static async submitInitiation(
    id: string,
    data: { effectiveDate: Date; lastSemester: string },
  ) {
    return prisma.seatCancellation.update({
      where: { id },
      data: {
        effectiveDate: data.effectiveDate,
        lastSemester: data.lastSemester,
        currentPhase: 2,
      },
      select: DETAIL_SELECT,
    });
  }

  static async scheduleCounseling(
    id: string,
    data: {
      counselorId: string;
      scheduledAt: Date;
      meetingUrl: string | null;
      meetingId: string | null;
      googleEventId: string | null;
    },
  ) {
    return prisma.seatCancellation.update({
      where: { id },
      data: {
        counselorId: data.counselorId,
        scheduledAt: data.scheduledAt,
        meetingUrl: data.meetingUrl,
        meetingId: data.meetingId,
        googleEventId: data.googleEventId,
        counselingCompletedAt: new Date(),
        currentPhase: 3,
      },
      select: DETAIL_SELECT,
    });
  }

  static async submitCounselingOutcome(
    id: string,
    data: {
      notes: string | null;
      outcome: string;
      suggestedCaseType: string | null;
    },
  ) {
    return prisma.seatCancellation.update({
      where: { id },
      data: {
        counselingNotes: data.notes,
        counselingOutcome: data.outcome,
        suggestedCaseType: data.suggestedCaseType,
        currentPhase: 4,
      },
      select: DETAIL_SELECT,
    });
  }

  static async submitSettlement(
    id: string,
    data: {
      caseType: string;
      penaltyAmount: number | null;
      penaltyPaidAt: Date | null;
      refundCalculationMethod: string | null;
      refundCalculationValue: number | null;
      refundAmount: number | null;
    },
  ) {
    return prisma.seatCancellation.update({
      where: { id },
      data: {
        caseType: data.caseType,
        penaltyAmount: data.penaltyAmount,
        penaltyPaidAt: data.penaltyPaidAt,
        refundCalculationMethod: data.refundCalculationMethod,
        refundCalculationValue: data.refundCalculationValue,
        refundAmount: data.refundAmount,
        settledAt: new Date(),
        currentPhase: 5,
      },
      select: DETAIL_SELECT,
    });
  }

  static async finalizeClearance(
    tx: Prisma.TransactionClient,
    id: string,
    data: {
      processedBy: string;
      refundTransactionRef: string | null;
      refundPaymentMethod: string | null;
      refundProcessedAt: Date | null;
      refundStatus: string | null;
    },
  ) {
    return tx.seatCancellation.update({
      where: { id },
      data: {
        documentsHandedOverAt: new Date(),
        refundTransactionRef: data.refundTransactionRef,
        refundPaymentMethod: data.refundPaymentMethod,
        refundProcessedAt: data.refundProcessedAt,
        refundStatus: data.refundStatus,
        status: "approved",
        processedBy: data.processedBy,
        processedAt: new Date(),
      },
      select: DETAIL_SELECT,
    });
  }

  static async addPhaseLog(
    client: Prisma.TransactionClient | typeof prisma,
    data: {
      seatCancellationId: string;
      phase: number;
      action: string;
      performedBy: string;
    },
  ) {
    return client.seatCancellationPhaseLog.create({ data });
  }
}
