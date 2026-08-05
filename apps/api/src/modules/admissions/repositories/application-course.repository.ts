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

  static async create(data: {
    applicationId: string;
    courseId: string;
    applicationFee: number;
    courseQuotaSeatId: string | null;
    isPrimary: boolean;
    preferenceOrder: number;
  }) {
    return prisma.applicationCourse.create({
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
  ) {
    return prisma.applicationCourse.update({
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
  ) {
    return tx.applicationCourse.update({
      where: { id },
      data: { status, statusUpdatedAt: new Date() },
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
    },
  ) {
    return tx.applicationStatusLog.create({ data });
  }
}
