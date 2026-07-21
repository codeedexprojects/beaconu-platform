import { ConflictError, NotFoundError } from "@/shared/errors";
import { CourseQuotaSeatsRepository } from "../repositories/course-quota-seats.repository";
import type {
  AttachCourseQuotaInput,
  UpdateCourseQuotaSeatsInput,
} from "../validators/course-quota-seats.validator";

type CourseQuotaSeatsRow = NonNullable<
  Awaited<ReturnType<typeof CourseQuotaSeatsRepository.findByCourseAndQuota>>
>;

function toDto(row: CourseQuotaSeatsRow) {
  const { collegeQuota, seatPool, ...rest } = row;
  const isPooled = seatPool !== null;
  return {
    ...rest,
    quotaName: collegeQuota.name,
    quotaSlug: collegeQuota.slug,
    bucketType: collegeQuota.bucketType,
    isPooled,
    totalSeats: isPooled ? seatPool.totalSeats : rest.totalSeats,
    openSeats: isPooled ? seatPool.openSeats : rest.openSeats,
  };
}

async function assertCourseInCycle(
  admissionCycleId: string,
  courseId: string,
  collegeId: string,
) {
  const row = await CourseQuotaSeatsRepository.findCourseInCycle(
    admissionCycleId,
    courseId,
    collegeId,
  );
  if (!row) {
    throw new NotFoundError("Course is not attached to this application form");
  }
  return row;
}

export class CourseQuotaSeatsService {
  static async listForCourse(
    admissionCycleId: string,
    courseId: string,
    collegeId: string,
  ) {
    const cycleCourse = await assertCourseInCycle(
      admissionCycleId,
      courseId,
      collegeId,
    );
    const rows = await CourseQuotaSeatsRepository.findByAdmissionCycleCourseId(
      cycleCourse.id,
    );
    return rows.map(toDto);
  }

  static async attachQuota(
    admissionCycleId: string,
    courseId: string,
    collegeId: string,
    body: AttachCourseQuotaInput,
  ) {
    const cycleCourse = await assertCourseInCycle(
      admissionCycleId,
      courseId,
      collegeId,
    );

    const quota = await CourseQuotaSeatsRepository.findCollegeQuotaInCollege(
      body.college_quota_id,
      collegeId,
    );
    if (!quota) throw new NotFoundError("Quota");
    if (!quota.isActive) {
      throw new ConflictError(
        "Cannot add seats for an inactive quota. Reactivate it first.",
      );
    }

    // A prior detach soft-deletes the (cycleCourse, quota) row rather than
    // removing it, so re-attaching must reactivate that row instead of
    // violating the unique constraint.
    const existing = await CourseQuotaSeatsRepository.findByCourseAndQuota(
      cycleCourse.id,
      body.college_quota_id,
    );

    if (existing) {
      if (existing.isActive) {
        throw new ConflictError(
          existing.seatPoolId
            ? "This course already shares a seat pool for this quota. Edit seats from the seat pool instead."
            : "Seats for this quota are already configured for this course",
        );
      }
      const row = await CourseQuotaSeatsRepository.reactivateExclusive(
        existing.id,
        body.total_seats,
      );
      return toDto(row);
    }

    const row = await CourseQuotaSeatsRepository.create({
      admissionCycleCourseId: cycleCourse.id,
      collegeQuotaId: body.college_quota_id,
      totalSeats: body.total_seats,
    });
    return toDto(row);
  }

  static async updateQuotaSeats(
    admissionCycleId: string,
    courseId: string,
    collegeId: string,
    id: string,
    body: UpdateCourseQuotaSeatsInput,
  ) {
    const cycleCourse = await assertCourseInCycle(
      admissionCycleId,
      courseId,
      collegeId,
    );

    const existing = await CourseQuotaSeatsRepository.findById(
      cycleCourse.id,
      id,
    );
    if (!existing) throw new NotFoundError("Course quota seats not found");
    if (existing.seatPoolId && body.total_seats !== undefined) {
      throw new ConflictError(
        "This course shares a seat pool for this quota. Edit seats from the seat pool instead.",
      );
    }

    const row = await CourseQuotaSeatsRepository.update(cycleCourse.id, id, {
      totalSeats: body.total_seats,
      isActive: body.is_active,
    });
    if (!row) throw new NotFoundError("Course quota seats not found");
    return toDto(row);
  }

  static async detachQuota(
    admissionCycleId: string,
    courseId: string,
    collegeId: string,
    id: string,
  ) {
    const cycleCourse = await assertCourseInCycle(
      admissionCycleId,
      courseId,
      collegeId,
    );

    const row = await CourseQuotaSeatsRepository.softDeleteById(
      cycleCourse.id,
      id,
    );
    if (!row) throw new NotFoundError("Course quota seats not found");
    return toDto(row);
  }
}
