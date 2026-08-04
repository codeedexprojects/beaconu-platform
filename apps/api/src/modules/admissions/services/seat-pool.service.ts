import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors";
import { SeatPoolRepository } from "../repositories/seat-pool.repository";
import type {
  CreateSeatPoolInput,
  UpdateSeatPoolInput,
} from "../validators/seat-pool.validator";

type SeatPoolRow = Awaited<
  ReturnType<typeof SeatPoolRepository.findByCycleId>
>[number];

function toDto(row: SeatPoolRow) {
  const { collegeQuota, courseQuotas, ...rest } = row;
  return {
    ...rest,
    quotaName: collegeQuota.name,
    quotaSlug: collegeQuota.slug,
    bucketType: collegeQuota.bucketType,
    courses: courseQuotas.map((cq) => ({
      id: cq.admissionCycleCourse.course.id,
      name: cq.admissionCycleCourse.course.name,
      code: cq.admissionCycleCourse.course.code,
    })),
  };
}

async function assertCycleInCollege(
  admissionCycleId: string,
  collegeId: string,
) {
  const cycle = await SeatPoolRepository.findCycleInCollege(
    admissionCycleId,
    collegeId,
  );
  if (!cycle) throw new NotFoundError("Application form not found");
}

async function resolveCoursesForPool(
  admissionCycleId: string,
  collegeQuotaId: string,
  courseIds: string[],
  excludePoolId?: string,
) {
  const cycleCourses = await SeatPoolRepository.findActiveCycleCourses(
    admissionCycleId,
    courseIds,
  );
  const foundCourseIds = new Set(cycleCourses.map((c) => c.courseId));
  const missing = courseIds.filter((id) => !foundCourseIds.has(id));
  if (missing.length > 0) {
    throw new ValidationError(
      `These courses are not attached to this application form: ${missing.join(", ")}`,
    );
  }

  const existingRows = await SeatPoolRepository.findCourseQuotaSeatsFor(
    collegeQuotaId,
    cycleCourses.map((c) => c.id),
  );
  const existingByCycleCourseId = new Map(
    existingRows.map((r) => [r.admissionCycleCourseId, r]),
  );

  const conflicts: string[] = [];
  const courses = cycleCourses.map((cc) => {
    const existing = existingByCycleCourseId.get(cc.id);
    if (existing?.isActive && existing.seatPoolId !== excludePoolId) {
      conflicts.push(cc.courseId);
    }
    return {
      admissionCycleCourseId: cc.id,
      existingSeatRowId: existing?.id,
    };
  });

  if (conflicts.length > 0) {
    throw new ConflictError(
      `These courses already have seats configured for this quota: ${conflicts.join(", ")}`,
    );
  }

  return courses;
}

export class SeatPoolService {
  static async listPools(admissionCycleId: string, collegeId: string) {
    await assertCycleInCollege(admissionCycleId, collegeId);
    const rows = await SeatPoolRepository.findByCycleId(admissionCycleId);
    return rows.map(toDto);
  }

  static async createPool(
    admissionCycleId: string,
    collegeId: string,
    body: CreateSeatPoolInput,
  ) {
    await assertCycleInCollege(admissionCycleId, collegeId);

    const quota = await SeatPoolRepository.findCollegeQuotaInCollege(
      body.college_quota_id,
      collegeId,
    );
    if (!quota) throw new NotFoundError("Quota");
    if (!quota.isActive) {
      throw new ConflictError(
        "Cannot create a seat pool for an inactive quota. Reactivate it first.",
      );
    }

    const courses = await resolveCoursesForPool(
      admissionCycleId,
      body.college_quota_id,
      body.course_ids,
    );

    const row = await SeatPoolRepository.create({
      collegeQuotaId: body.college_quota_id,
      admissionCycleId,
      totalSeats: body.total_seats,
      courses,
    });
    return toDto(row);
  }

  static async updatePool(
    admissionCycleId: string,
    collegeId: string,
    id: string,
    body: UpdateSeatPoolInput,
  ) {
    await assertCycleInCollege(admissionCycleId, collegeId);

    const pool = await SeatPoolRepository.findById(admissionCycleId, id);
    if (!pool) throw new NotFoundError("Seat pool not found");

    const courses = body.course_ids
      ? await resolveCoursesForPool(
          admissionCycleId,
          pool.collegeQuotaId,
          body.course_ids,
          id,
        )
      : undefined;

    const row = await SeatPoolRepository.update(admissionCycleId, id, {
      collegeQuotaId: pool.collegeQuotaId,
      totalSeats: body.total_seats,
      isActive: body.is_active,
      courses,
    });
    if (!row) throw new NotFoundError("Seat pool not found");
    return toDto(row);
  }

  static async deletePool(
    admissionCycleId: string,
    collegeId: string,
    id: string,
  ) {
    await assertCycleInCollege(admissionCycleId, collegeId);

    const row = await SeatPoolRepository.softDeleteById(admissionCycleId, id);
    if (!row) throw new NotFoundError("Seat pool not found");
    return toDto(row);
  }
}
