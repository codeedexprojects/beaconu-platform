import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors";
import { SeatMatrixRepository } from "../repositories/seat-matrix.repository";
import type {
  CreateSeatPoolInput,
  UpdateSeatPoolInput,
} from "../validators/seat-matrix.validator";

type SeatPoolRow = NonNullable<
  Awaited<ReturnType<typeof SeatMatrixRepository.findByCycleAndQuota>>
>;

function toDto(row: SeatPoolRow) {
  const { collegeQuota, seatMatrixCourses, ...rest } = row;
  return {
    ...rest,
    quotaName: collegeQuota.name,
    quotaSlug: collegeQuota.slug,
    bucketType: collegeQuota.bucketType,
    courses: seatMatrixCourses.map((smc) => ({
      id: smc.course.id,
      name: smc.course.name,
      code: smc.course.code,
    })),
  };
}

async function assertCycleInCollege(
  admissionCycleId: string,
  collegeId: string,
) {
  const cycle = await SeatMatrixRepository.findCycleInCollege(
    admissionCycleId,
    collegeId,
  );
  if (!cycle) throw new NotFoundError("Application form not found");
}

async function assertCoursesActiveInCycle(
  admissionCycleId: string,
  courseIds: string[],
) {
  const activeIds = await SeatMatrixRepository.findActiveCycleCourseIds(
    admissionCycleId,
    courseIds,
  );
  const missing = courseIds.filter((id) => !activeIds.has(id));
  if (missing.length > 0) {
    throw new ValidationError(
      `These courses are not attached to this application form: ${missing.join(", ")}`,
    );
  }
}

export class SeatMatrixService {
  static async listPools(admissionCycleId: string, collegeId: string) {
    await assertCycleInCollege(admissionCycleId, collegeId);
    const rows = await SeatMatrixRepository.findByCycleId(admissionCycleId);
    return rows.map(toDto);
  }

  static async createPool(
    admissionCycleId: string,
    collegeId: string,
    body: CreateSeatPoolInput,
  ) {
    await assertCycleInCollege(admissionCycleId, collegeId);

    const collegeQuota = await SeatMatrixRepository.findCollegeQuotaInCollege(
      body.college_quota_id,
      collegeId,
    );
    if (!collegeQuota) throw new NotFoundError("Quota");
    if (!collegeQuota.isActive) {
      throw new ConflictError(
        "Cannot create a seat pool for an inactive quota. Reactivate it first.",
      );
    }

    await assertCoursesActiveInCycle(admissionCycleId, body.course_ids);

    // A prior deactivation soft-deletes the (admissionCycleId,
    // collegeQuotaId) row rather than removing it, so re-creating must
    // reactivate that row instead of violating the unique constraint.
    const existing = await SeatMatrixRepository.findByCycleAndQuota(
      admissionCycleId,
      body.college_quota_id,
    );

    if (existing) {
      if (existing.isActive) {
        throw new ConflictError(
          "A seat pool for this quota already exists in this application form",
        );
      }
      const row = await SeatMatrixRepository.reactivate(existing.id, {
        totalSeats: body.total_seats,
        courseIds: body.course_ids,
      });
      return toDto(row);
    }

    const row = await SeatMatrixRepository.create({
      collegeQuotaId: body.college_quota_id,
      admissionCycleId,
      totalSeats: body.total_seats,
      courseIds: body.course_ids,
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

    if (body.course_ids) {
      await assertCoursesActiveInCycle(admissionCycleId, body.course_ids);
    }

    const row = await SeatMatrixRepository.update(admissionCycleId, id, {
      totalSeats: body.total_seats,
      courseIds: body.course_ids,
      isActive: body.is_active,
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

    const row = await SeatMatrixRepository.softDeleteById(admissionCycleId, id);
    if (!row) throw new NotFoundError("Seat pool not found");
    return toDto(row);
  }
}
