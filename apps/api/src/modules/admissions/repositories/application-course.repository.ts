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

  /** Cycle+course lookup used both to browse fee/quota options and to
   * validate a selection at add-time — course must still be active on the
   * cycle. */
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

  /** Courses/quota are freely editable while building up the application,
   * and lock the instant a payment order exists — even before it's
   * confirmed, so the total can't shift out from under a pending order.
   * "pending" or "completed" locks; "failed" doesn't, so a failed attempt
   * lets the student go back and adjust courses before retrying. Reads the
   * Transaction table directly (shared table, not the payments module's
   * repository/service) — same one-directional pattern used by the
   * payments module reading ApplicationCourse directly, avoiding a
   * circular import between the two modules. */
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

  /** A prior withdraw soft-deletes (status: "withdrawn") rather than
   * removing the row, so re-adding the same course must reactivate that row
   * instead of violating the (applicationId, courseId) unique constraint.
   * isPrimary is intentionally not part of the reactivate payload — a
   * withdrawn-then-re-added course never reclaims primary status; the
   * primary slot is fixed at Start Application. */
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

  /** Soft-delete only — sets status to "withdrawn" rather than removing the
   * row, so the fee snapshot and history survive. */
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

  /** Read inside the transaction to avoid a TOCTOU gap between checking
   * pool linkage and decrementing — seatPoolId rarely changes, but the seat
   * count itself does, and this keeps both reads under the same snapshot. */
  static async findSeatPoolLink(
    tx: Prisma.TransactionClient,
    courseQuotaSeatId: string,
  ) {
    return tx.courseQuotaSeats.findUnique({
      where: { id: courseQuotaSeatId },
      select: { seatPoolId: true },
    });
  }

  /** Atomic conditional decrement — the WHERE openSeats > 0 clause is
   * evaluated by Postgres at UPDATE time, so concurrent submits racing for
   * the last seat can't both succeed; count === 0 means we lost the race. */
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
