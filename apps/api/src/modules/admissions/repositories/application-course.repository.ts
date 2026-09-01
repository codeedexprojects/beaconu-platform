import { prisma, Prisma } from "@beaconu/db";

const APPLICATION_COURSE_SELECT = {
  id: true,
  applicationId: true,
  courseId: true,
  applicationFee: true,
  status: true,
  courseQuotaSeatId: true,
  isPrimary: true,
  preferenceOrder: true,
  createdAt: true,
  updatedAt: true,
  course: { select: { id: true, name: true, code: true } },
} as const;

export class ApplicationCourseRepository {
  static async findApplicationForStudent(
    applicationId: string,
    studentId: string,
  ) {
    return prisma.application.findFirst({
      where: { id: applicationId, studentId },
      select: {
        id: true,
        collegeId: true,
        admissionCycleId: true,
        formStatus: true,
        feePaymentStatus: true,
      },
    });
  }

  static async findAdmissionCycleCourse(
    admissionCycleId: string,
    courseId: string,
  ) {
    return prisma.admissionCycleCourse.findFirst({
      where: { admissionCycleId, courseId, isActive: true },
      select: { id: true, applicationFee: true },
    });
  }

  static async findCourseQuotaSeat(id: string, admissionCycleCourseId: string) {
    return prisma.courseQuotaSeats.findFirst({
      where: { id, admissionCycleCourseId, isActive: true },
      select: {
        id: true,
        collegeQuotaId: true,
        totalSeats: true,
        openSeats: true,
        seatPool: { select: { openSeats: true } },
      },
    });
  }

  static async findQuotaAdjustments(
    courseId: string,
    collegeQuotaIds: string[],
  ) {
    return prisma.courseQuota.findMany({
      where: {
        courseId,
        collegeQuotaId: { in: collegeQuotaIds },
        isActive: true,
      },
      select: {
        collegeQuotaId: true,
        appFeeAdjustmentType: true,
        appFeeAdjustmentValue: true,
        tuitionFeeOverride: true,
      },
    });
  }

  static async findPrimaryForApplication(applicationId: string) {
    return prisma.applicationCourse.findFirst({
      where: { applicationId, isPrimary: true },
      select: { id: true, applicationFee: true, courseId: true },
    });
  }

  static async isPaymentLocked(applicationId: string) {
    const txn = await prisma.transaction.findFirst({
      where: {
        status: { in: ["pending", "completed"] },
        ledgerEntry: { applicationCourse: { applicationId } },
      },
      select: { id: true },
    });
    return !!txn;
  }

  static async findExistingSelection(applicationId: string, courseId: string) {
    return prisma.applicationCourse.findUnique({
      where: { uq_application_course: { applicationId, courseId } },
      select: { id: true, status: true },
    });
  }

  static async create(
    data: {
      applicationId: string;
      courseId: string;
      applicationFee: number;
      courseQuotaSeatId: string | null;
      isPrimary: boolean;
      preferenceOrder: number;
    },
    tx: Prisma.TransactionClient | typeof prisma = prisma,
  ) {
    return tx.applicationCourse.create({
      data,
      select: APPLICATION_COURSE_SELECT,
    });
  }

  static async reactivate(
    id: string,
    data: {
      applicationFee: number;
      courseQuotaSeatId: string | null;
      preferenceOrder: number;
    },
    tx: Prisma.TransactionClient | typeof prisma = prisma,
  ) {
    return tx.applicationCourse.update({
      where: { id },
      data: { ...data, status: "draft", statusUpdatedAt: new Date() },
      select: APPLICATION_COURSE_SELECT,
    });
  }

  static async findByIdForApplication(applicationId: string, id: string) {
    return prisma.applicationCourse.findFirst({
      where: { id, applicationId },
      select: APPLICATION_COURSE_SELECT,
    });
  }

  static async withdraw(id: string) {
    return prisma.applicationCourse.update({
      where: { id },
      data: { status: "withdrawn", statusUpdatedAt: new Date() },
      select: { id: true },
    });
  }

  static async updateQuota(
    id: string,
    data: { applicationFee: number; courseQuotaSeatId: string | null },
  ) {
    return prisma.applicationCourse.update({
      where: { id },
      data,
      select: APPLICATION_COURSE_SELECT,
    });
  }

  static async sumActiveApplicationFees(applicationId: string) {
    const result = await prisma.applicationCourse.aggregate({
      where: { applicationId, status: { not: "withdrawn" } },
      _sum: { applicationFee: true },
    });
    return result._sum.applicationFee?.toNumber() ?? 0;
  }

  static async updateApplicationTotalFee(applicationId: string, total: number) {
    return prisma.application.update({
      where: { id: applicationId },
      data: { totalApplicationFee: total },
      select: { id: true },
    });
  }

  static async findActiveForSubmit(applicationId: string) {
    return prisma.applicationCourse.findMany({
      where: { applicationId, status: { not: "withdrawn" } },
      select: { id: true, courseQuotaSeatId: true },
    });
  }

  static async findSeatPoolLink(
    tx: Prisma.TransactionClient,
    courseQuotaSeatId: string,
  ) {
    return tx.courseQuotaSeats.findUnique({
      where: { id: courseQuotaSeatId },
      select: { seatPoolId: true },
    });
  }

  static async decrementExclusiveSeat(
    tx: Prisma.TransactionClient,
    courseQuotaSeatId: string,
  ) {
    return tx.courseQuotaSeats.updateMany({
      where: { id: courseQuotaSeatId, openSeats: { gt: 0 } },
      data: { openSeats: { decrement: 1 } },
    });
  }

  static async decrementPoolSeat(
    tx: Prisma.TransactionClient,
    seatPoolId: string,
  ) {
    return tx.seatPool.updateMany({
      where: { id: seatPoolId, openSeats: { gt: 0 } },
      data: { openSeats: { decrement: 1 } },
    });
  }

  static async incrementExclusiveSeat(
    tx: Prisma.TransactionClient,
    courseQuotaSeatId: string,
  ) {
    return tx.courseQuotaSeats.update({
      where: { id: courseQuotaSeatId },
      data: { openSeats: { increment: 1 } },
    });
  }

  static async incrementPoolSeat(
    tx: Prisma.TransactionClient,
    seatPoolId: string,
  ) {
    return tx.seatPool.update({
      where: { id: seatPoolId },
      data: { openSeats: { increment: 1 } },
    });
  }

  static async markSubmitted(tx: Prisma.TransactionClient, id: string) {
    return tx.applicationCourse.update({
      where: { id },
      data: { status: "submitted", statusUpdatedAt: new Date() },
      select: { id: true },
    });
  }

  static async findByIdWithStatus(id: string) {
    return prisma.applicationCourse.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
  }

  static async findByIdWithStatusAndCycleFlags(id: string) {
    return prisma.applicationCourse.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        application: {
          select: {
            admissionCycle: {
              select: { assessmentRequired: true, interviewRequired: true },
            },
          },
        },
      },
    });
  }

  /** Bulk read for ApplicationCourseService.listPendingShortlist — every
   * non-withdrawn course at this college currently sitting at ANY of the
   * three statuses that could be "ready" (submitted / assessment_completed
   * / interview_completed) — final per-cycle filtering (which one is
   * actually correct for that course's cycle) happens in the service,
   * same "duplicate a minimal cross-module read, filter in code" pattern
   * already used by findInterviewEligibleForCollege. */
  static async findPendingShortlistCandidatesForCollege(
    collegeId: string,
    filters: { search?: string } = {},
  ) {
    return prisma.applicationCourse.findMany({
      where: {
        status: {
          in: ["submitted", "assessment_completed", "interview_completed"],
        },
        application: {
          collegeId,
          ...(filters.search && {
            OR: [
              {
                applicationNumber: {
                  contains: filters.search,
                  mode: "insensitive" as const,
                },
              },
              {
                student: {
                  fullName: {
                    contains: filters.search,
                    mode: "insensitive" as const,
                  },
                },
              },
            ],
          }),
        },
      },
      select: {
        id: true,
        status: true,
        isPrimary: true,
        statusUpdatedAt: true,
        course: { select: { name: true, code: true } },
        application: {
          select: {
            id: true,
            applicationNumber: true,
            studentId: true,
            student: {
              select: { fullName: true, email: true, phoneNumber: true },
            },
            admissionCycle: {
              select: {
                name: true,
                assessmentRequired: true,
                interviewRequired: true,
              },
            },
          },
        },
      },
      orderBy: { statusUpdatedAt: "desc" },
    });
  }

  static async findPendingShortlistDetailForCollege(
    id: string,
    collegeId: string,
  ) {
    return prisma.applicationCourse.findFirst({
      where: { id, application: { collegeId } },
      select: {
        id: true,
        status: true,
        isPrimary: true,
        applicationFee: true,
        statusUpdatedAt: true,
        course: { select: { name: true, code: true } },
        application: {
          select: {
            id: true,
            applicationNumber: true,
            studentId: true,
            student: {
              select: { fullName: true, email: true, phoneNumber: true },
            },
            admissionCycle: {
              select: {
                name: true,
                assessmentRequired: true,
                interviewRequired: true,
              },
            },
          },
        },
      },
    });
  }

  static async findByIdWithOwnership(id: string) {
    return prisma.applicationCourse.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        application: { select: { studentId: true, collegeId: true } },
      },
    });
  }

  static async findByIdForOfferIssuance(id: string) {
    return prisma.applicationCourse.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        courseId: true,
        application: {
          select: { studentId: true, collegeId: true, admissionCycleId: true },
        },
      },
    });
  }

  static async findByIdForEnrollment(id: string) {
    return prisma.applicationCourse.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        courseId: true,
        courseQuotaSeatId: true,
        course: { select: { name: true, code: true } },
        application: {
          select: {
            studentId: true,
            collegeId: true,
            admissionCycleId: true,
            campusId: true,
            college: { select: { code: true } },
            admissionCycle: { select: { admissionYear: true } },
            student: { select: { fullName: true } },
          },
        },
      },
    });
  }

  static async markAssessmentCompleted(
    tx: Prisma.TransactionClient,
    id: string,
  ) {
    return tx.applicationCourse.update({
      where: { id },
      data: { status: "assessment_completed", statusUpdatedAt: new Date() },
      select: { id: true },
    });
  }

  static async updateStatus(
    tx: Prisma.TransactionClient,
    id: string,
    status: string,
    data?: { rejectionReason?: string },
  ) {
    return tx.applicationCourse.update({
      where: { id },
      data: {
        status,
        statusUpdatedAt: new Date(),
        ...(data?.rejectionReason !== undefined && {
          rejectionReason: data.rejectionReason,
        }),
      },
      select: { id: true },
    });
  }

  static async createStatusLog(
    tx: Prisma.TransactionClient,
    data: {
      applicationCourseId: string;
      fromStatus: string;
      toStatus: string;
      changedByType: string;
      changedById: string;
      remarks?: string;
    },
  ) {
    return tx.applicationStatusLog.create({ data });
  }
}
