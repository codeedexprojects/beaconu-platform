import { prisma } from "@beaconu/db";
import { quotaOptionsForCourse } from "./quota-options.helper";

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

export class ApplicationPaymentSummaryQuery {
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
