import { prisma } from "@beaconu/db";
import { applyFeeAdjustment } from "../services/application-course.service";

async function isLocked(applicationId: string): Promise<boolean> {
  const txn = await prisma.transaction.findFirst({
    where: {
      status: { in: ["pending", "completed"] },
      ledgerEntry: { applicationCourse: { applicationId } },
    },
    select: { id: true },
  });
  return !!txn;
}

async function quotaOptionsForCourse(
  admissionCycleCourseId: string,
  courseId: string,
  baseFee: number,
) {
  const seats = await prisma.courseQuotaSeats.findMany({
    where: { admissionCycleCourseId, isActive: true },
    select: {
      id: true,
      collegeQuotaId: true,
      totalSeats: true,
      openSeats: true,
      seatPool: { select: { totalSeats: true, openSeats: true } },
      collegeQuota: {
        select: { id: true, name: true, slug: true, bucketType: true },
      },
    },
  });
  const adjustments = await prisma.courseQuota.findMany({
    where: {
      courseId,
      collegeQuotaId: { in: seats.map((s) => s.collegeQuotaId) },
      isActive: true,
    },
    select: {
      collegeQuotaId: true,
      appFeeAdjustmentType: true,
      appFeeAdjustmentValue: true,
      tuitionFeeOverride: true,
    },
  });
  const adjustmentByQuota = new Map(
    adjustments.map((a) => [a.collegeQuotaId, a]),
  );

  return seats.map((s) => {
    const adjustment = adjustmentByQuota.get(s.collegeQuotaId);
    const isPooled = s.seatPool !== null;
    return {
      courseQuotaSeatId: s.id,
      collegeQuotaId: s.collegeQuotaId,
      quotaName: s.collegeQuota.name,
      quotaSlug: s.collegeQuota.slug,
      bucketType: s.collegeQuota.bucketType,
      applicationFee: applyFeeAdjustment(
        baseFee,
        adjustment?.appFeeAdjustmentType,
        adjustment?.appFeeAdjustmentValue,
      ).toString(),
      tuitionFeeOverride: adjustment?.tuitionFeeOverride?.toString() ?? null,
      totalSeats: isPooled ? s.seatPool!.totalSeats : s.totalSeats,
      openSeats: isPooled ? s.seatPool!.openSeats : s.openSeats,
    };
  });
}

export class ApplicationPaymentSummaryQuery {
  /** Everything the payment summary page needs in one call: every course
   * already added to the application (primary + any extra, in preference
   * order), each with its currently-chosen quota and the full list of
   * alternative quota options so the page can offer a picker inline —
   * plus the grand total and whether courses/quota are still editable
   * (isLocked, true once a payment order exists). Selecting a different
   * quota on this page is a separate mutation (changeQuota); this query
   * itself never writes anything. */
  static async getForApplication(applicationId: string) {
    const [application, courses, locked] = await Promise.all([
      prisma.application.findUniqueOrThrow({
        where: { id: applicationId },
        select: {
          admissionCycleId: true,
          totalApplicationFee: true,
          feePaymentStatus: true,
        },
      }),
      prisma.applicationCourse.findMany({
        where: { applicationId, status: { not: "withdrawn" } },
        select: {
          id: true,
          courseId: true,
          isPrimary: true,
          preferenceOrder: true,
          applicationFee: true,
          courseQuotaSeatId: true,
          course: { select: { id: true, name: true, code: true } },
          courseQuotaSeat: {
            select: {
              admissionCycleCourseId: true,
              collegeQuota: { select: { name: true } },
            },
          },
        },
        orderBy: { preferenceOrder: "asc" },
      }),
      isLocked(applicationId),
    ]);

    const courseSummaries = await Promise.all(
      courses.map(async (c) => {
        // Resolve the AdmissionCycleCourse row for the base fee — via the
        // currently-selected seat's link if a quota is chosen, else by
        // (cycle, course) the same way addCourse looks it up.
        const cycleCourse = c.courseQuotaSeat
          ? await prisma.admissionCycleCourse.findUnique({
              where: { id: c.courseQuotaSeat.admissionCycleCourseId },
              select: { id: true, applicationFee: true },
            })
          : await prisma.admissionCycleCourse.findFirst({
              where: {
                admissionCycleId: application.admissionCycleId,
                courseId: c.courseId,
                isActive: true,
              },
              select: { id: true, applicationFee: true },
            });

        const baseFee =
          cycleCourse?.applicationFee.toNumber() ?? c.applicationFee.toNumber();

        const quotaOptions = cycleCourse
          ? await quotaOptionsForCourse(cycleCourse.id, c.courseId, baseFee)
          : [];

        return {
          applicationCourseId: c.id,
          courseId: c.courseId,
          courseName: c.course.name,
          courseCode: c.course.code,
          isPrimary: c.isPrimary,
          preferenceOrder: c.preferenceOrder,
          selectedQuota: c.courseQuotaSeatId
            ? {
                courseQuotaSeatId: c.courseQuotaSeatId,
                quotaName: c.courseQuotaSeat?.collegeQuota.name ?? null,
                applicationFee: c.applicationFee.toString(),
              }
            : null,
          applicationFee: c.applicationFee.toString(),
          quotaOptions,
        };
      }),
    );

    return {
      courses: courseSummaries,
      totalApplicationFee: application.totalApplicationFee.toString(),
      feePaymentStatus: application.feePaymentStatus,
      isLocked: locked,
    };
  }
}
