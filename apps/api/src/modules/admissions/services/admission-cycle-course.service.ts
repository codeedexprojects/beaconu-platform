import { ConflictError, NotFoundError } from "@/shared/errors";
import { AdmissionCycleCourseRepository } from "../repositories/admission-cycle-course.repository";
import type {
  AttachAdmissionCycleCourseInput,
  UpdateAdmissionCycleCourseInput,
} from "../validators/admission-cycle-course.validator";

type CycleCourseRow = NonNullable<
  Awaited<
    ReturnType<typeof AdmissionCycleCourseRepository.findByCycleAndCourse>
  >
>;

function toDto(row: CycleCourseRow) {
  const { course, applicationFee, ...rest } = row;
  return {
    ...rest,
    applicationFee: applicationFee.toString(),
    courseName: course.name,
    courseCode: course.code,
  };
}

async function assertCycleInCollege(cycleId: string, collegeId: string) {
  const cycle = await AdmissionCycleCourseRepository.findCycleInCollege(
    cycleId,
    collegeId,
  );
  if (!cycle) throw new NotFoundError("Application form not found");
}

export class AdmissionCycleCourseService {
  static async listCourses(admissionCycleId: string, collegeId: string) {
    await assertCycleInCollege(admissionCycleId, collegeId);
    const rows =
      await AdmissionCycleCourseRepository.findByCycleId(admissionCycleId);
    return rows.map(toDto);
  }

  static async attachCourse(
    admissionCycleId: string,
    collegeId: string,
    body: AttachAdmissionCycleCourseInput,
  ) {
    await assertCycleInCollege(admissionCycleId, collegeId);

    const course = await AdmissionCycleCourseRepository.findCourseInCollege(
      body.course_id,
      collegeId,
    );
    if (!course) throw new NotFoundError("Course not found");

    // A prior detach soft-deletes the (admissionCycleId, courseId) row rather
    // than removing it, so re-attaching must reactivate that row instead of
    // creating a new one, which would violate the unique constraint.
    const existing = await AdmissionCycleCourseRepository.findByCycleAndCourse(
      admissionCycleId,
      body.course_id,
    );

    if (existing) {
      if (existing.isActive) {
        throw new ConflictError(
          "This course is already attached to the application form",
        );
      }
      const row = await AdmissionCycleCourseRepository.reactivate(existing.id, {
        applicationFee: body.application_fee,
        interviewRequired: body.interview_required,
        assessmentRequired: body.assessment_required,
        tokenPaymentStage: body.token_payment_stage ?? null,
        workExperienceRequired: body.work_experience_required,
      });
      return toDto(row);
    }

    const row = await AdmissionCycleCourseRepository.create({
      admissionCycleId,
      courseId: body.course_id,
      applicationFee: body.application_fee,
      interviewRequired: body.interview_required,
      assessmentRequired: body.assessment_required,
      tokenPaymentStage: body.token_payment_stage ?? null,
      workExperienceRequired: body.work_experience_required,
    });
    return toDto(row);
  }

  static async updateCourse(
    admissionCycleId: string,
    collegeId: string,
    id: string,
    body: UpdateAdmissionCycleCourseInput,
  ) {
    await assertCycleInCollege(admissionCycleId, collegeId);

    const data: Record<string, unknown> = {};
    if (body.application_fee !== undefined)
      data.applicationFee = body.application_fee;
    if (body.interview_required !== undefined)
      data.interviewRequired = body.interview_required;
    if (body.assessment_required !== undefined)
      data.assessmentRequired = body.assessment_required;
    if (body.token_payment_stage !== undefined)
      data.tokenPaymentStage = body.token_payment_stage;
    if (body.work_experience_required !== undefined)
      data.workExperienceRequired = body.work_experience_required;
    if (body.is_active !== undefined) data.isActive = body.is_active;

    const row = await AdmissionCycleCourseRepository.update(
      admissionCycleId,
      id,
      data,
    );
    if (!row)
      throw new NotFoundError(
        "Course is not attached to this application form",
      );
    return toDto(row);
  }

  static async detachCourse(
    admissionCycleId: string,
    collegeId: string,
    id: string,
  ) {
    await assertCycleInCollege(admissionCycleId, collegeId);

    const row = await AdmissionCycleCourseRepository.softDeleteById(
      admissionCycleId,
      id,
    );
    if (!row)
      throw new NotFoundError(
        "Course is not attached to this application form",
      );
    return toDto(row);
  }
}
