import { ConflictError, NotFoundError } from "@/shared/errors";
import { CourseQuotaRepository } from "../repositories/course-quota.repository";
import type {
  AttachCourseQuotaInput,
  UpdateCourseQuotaInput,
} from "../validators/course-quota.validator";

type CourseQuotaRow = NonNullable<
  Awaited<ReturnType<typeof CourseQuotaRepository.findById>>
>;

function toCourseQuotaDto(row: CourseQuotaRow) {
  const { collegeQuota, ...rest } = row;
  return {
    ...rest,
    quotaName: collegeQuota.name,
    quotaSlug: collegeQuota.slug,
    bucketType: collegeQuota.bucketType,
    quotaIsActive: collegeQuota.isActive,
  };
}

async function assertCourseInCollege(courseId: string, collegeId: string) {
  const course = await CourseQuotaRepository.findCourseInCollege(
    courseId,
    collegeId,
  );
  if (!course) throw new NotFoundError("Course not found");
}

export class CourseQuotaService {
  static async listCourseQuotas(courseId: string, collegeId: string) {
    await assertCourseInCollege(courseId, collegeId);
    const rows = await CourseQuotaRepository.findByCourseId(courseId);
    return rows.map(toCourseQuotaDto);
  }

  static async attachQuota(
    courseId: string,
    collegeId: string,
    body: AttachCourseQuotaInput,
  ) {
    await assertCourseInCollege(courseId, collegeId);

    const collegeQuota = await CourseQuotaRepository.findCollegeQuotaInCollege(
      body.collegeQuotaId,
      collegeId,
    );
    if (!collegeQuota) {
      throw new NotFoundError("Quota");
    }
    if (!collegeQuota.isActive) {
      throw new ConflictError(
        "Cannot attach an inactive quota. Reactivate it first.",
      );
    }

    // A prior detach soft-deletes the (courseId, collegeQuotaId) row rather
    // than removing it (soft-delete only; the row may also carry historical
    // fee data referenced by past applications). Re-attaching must reactivate
    // that row instead of creating a new one, which would violate the unique
    // constraint on the pair.
    const existing = await CourseQuotaRepository.findByCourseAndCollegeQuota(
      courseId,
      body.collegeQuotaId,
    );

    if (existing) {
      if (existing.isActive) {
        throw new ConflictError("This quota is already attached to the course");
      }
      const row = await CourseQuotaRepository.reactivate(existing.id, {
        appFeeAdjustmentType: body.appFeeAdjustmentType ?? null,
        appFeeAdjustmentValue: body.appFeeAdjustmentValue ?? null,
        tuitionFeeOverride: body.tuitionFeeOverride ?? null,
      });
      return toCourseQuotaDto(row);
    }

    const row = await CourseQuotaRepository.create({
      courseId,
      collegeQuotaId: body.collegeQuotaId,
      appFeeAdjustmentType: body.appFeeAdjustmentType ?? null,
      appFeeAdjustmentValue: body.appFeeAdjustmentValue ?? null,
      tuitionFeeOverride: body.tuitionFeeOverride ?? null,
    });
    return toCourseQuotaDto(row);
  }

  static async updateCourseQuota(
    courseId: string,
    collegeId: string,
    courseQuotaId: string,
    body: UpdateCourseQuotaInput,
  ) {
    await assertCourseInCollege(courseId, collegeId);

    const data: Record<string, unknown> = {};
    if (body.appFeeAdjustmentType !== undefined) {
      data.appFeeAdjustmentType = body.appFeeAdjustmentType;
    }
    if (body.appFeeAdjustmentValue !== undefined) {
      data.appFeeAdjustmentValue = body.appFeeAdjustmentValue;
    }
    if (body.tuitionFeeOverride !== undefined) {
      data.tuitionFeeOverride = body.tuitionFeeOverride;
    }
    if (body.isActive !== undefined) {
      data.isActive = body.isActive;
    }

    const row = await CourseQuotaRepository.update(
      courseId,
      courseQuotaId,
      data,
    );
    if (!row) throw new NotFoundError("Course quota not found");
    return toCourseQuotaDto(row);
  }

  static async detachQuota(
    courseId: string,
    collegeId: string,
    courseQuotaId: string,
  ) {
    await assertCourseInCollege(courseId, collegeId);

    const row = await CourseQuotaRepository.softDeleteById(
      courseId,
      courseQuotaId,
    );
    if (!row) throw new NotFoundError("Course quota not found");
    return toCourseQuotaDto(row);
  }
}
