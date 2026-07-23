import { prisma } from "@beaconu/db";
import { applyFeeAdjustment } from "../services/application-course.service";

/** Shared by the course catalogue and payment summary queries — both need
 * "every quota option for this course, with its computed fee." */
export async function quotaOptionsForCourse(
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
