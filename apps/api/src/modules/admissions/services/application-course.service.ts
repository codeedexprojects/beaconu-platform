import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { ApplicationCourseRepository } from "../repositories/application-course.repository";
import { ApplicationRepository } from "../repositories/application.repository";
import type { AddApplicationCourseInput } from "../validators/application-course.validator";

type ApplicationCourseRow = NonNullable<
  Awaited<ReturnType<typeof ApplicationCourseRepository.findByIdForApplication>>
>;

function toDto(row: ApplicationCourseRow) {
  const { course, applicationFee, ...rest } = row;
  return {
    ...rest,
    applicationFee: applicationFee.toString(),
    courseName: course.name,
    courseCode: course.code,
  };
}

export function applyFeeAdjustment(
  baseFee: number,
  type: string | null | undefined,
  value: unknown,
): number {
  if (!type || value == null) return baseFee;
  const numericValue = Number(value);
  const adjusted =
    type === "percentage"
      ? baseFee + (baseFee * numericValue) / 100
      : baseFee + numericValue;
  return Math.max(0, adjusted);
}

async function assertOwnDraftApplication(
  applicationId: string,
  studentId: string,
  requireNotLocked = true,
) {
  const application =
    await ApplicationCourseRepository.findApplicationForStudent(
      applicationId,
      studentId,
    );
  if (!application) throw new NotFoundError("Application not found");
  if (application.formStatus !== "draft") {
    throw new ConflictError(
      "This application has already been submitted and can no longer be edited",
    );
  }
  if (requireNotLocked) {
    const locked =
      await ApplicationCourseRepository.isPaymentLocked(applicationId);
    if (locked) {
      throw new ConflictError(
        "Courses and quotas can no longer be changed once payment is in progress",
      );
    }
  }
  return application;
}

export class ApplicationCourseService {
  static async addCourse(
    applicationId: string,
    studentId: string,
    body: AddApplicationCourseInput,
    options: { isPrimary?: boolean } = {},
  ) {
    const isPrimary = options.isPrimary ?? false;
    const application = await assertOwnDraftApplication(
      applicationId,
      studentId,
    );

    const cycleCourse =
      await ApplicationCourseRepository.findAdmissionCycleCourse(
        application.admissionCycleId,
        body.course_id,
      );
    if (!cycleCourse) {
      throw new NotFoundError("Course");
    }

    const existing = await ApplicationCourseRepository.findExistingSelection(
      applicationId,
      body.course_id,
    );
    if (existing && existing.status !== "withdrawn") {
      throw new ConflictError(
        "This course has already been added to your application",
      );
    }

    const crossAppSelection =
      await ApplicationRepository.findActiveCourseSelectionInCollege(
        studentId,
        application.collegeId,
        body.course_id,
      );
    if (
      crossAppSelection &&
      crossAppSelection.applicationId !== applicationId
    ) {
      throw new ConflictError(
        "You already have an active application for this course at this college",
      );
    }

    const baseFee = cycleCourse.applicationFee.toNumber();
    let finalFee = baseFee;
    let courseQuotaSeatId: string | null = null;

    if (body.course_quota_seat_id) {
      const seat = await ApplicationCourseRepository.findCourseQuotaSeat(
        body.course_quota_seat_id,
        cycleCourse.id,
      );
      if (!seat) {
        throw new NotFoundError("Quota");
      }

      const effectiveOpenSeats = seat.seatPool
        ? seat.seatPool.openSeats
        : seat.openSeats;
      if (effectiveOpenSeats == null || effectiveOpenSeats <= 0) {
        throw new ConflictError("No seats available for this quota");
      }

      const adjustment = await ApplicationCourseRepository.findQuotaAdjustments(
        body.course_id,
        [seat.collegeQuotaId],
      );
      finalFee = applyFeeAdjustment(
        baseFee,
        adjustment[0]?.appFeeAdjustmentType,
        adjustment[0]?.appFeeAdjustmentValue,
      );
      courseQuotaSeatId = seat.id;
    }

    const created =
      existing && existing.status === "withdrawn"
        ? await ApplicationCourseRepository.reactivate(existing.id, {
            applicationFee: finalFee,
            courseQuotaSeatId,
            preferenceOrder: body.preference_order ?? 1,
          })
        : await ApplicationCourseRepository.create({
            applicationId,
            courseId: body.course_id,
            applicationFee: finalFee,
            courseQuotaSeatId,
            isPrimary,
            preferenceOrder: body.preference_order ?? 1,
          });

    await ApplicationCourseService.recalculateTotalFee(applicationId);

    const full = await ApplicationCourseRepository.findByIdForApplication(
      applicationId,
      created.id,
    );
    return toDto(full!);
  }

  static async withdrawCourse(
    applicationId: string,
    studentId: string,
    id: string,
  ) {
    await assertOwnDraftApplication(applicationId, studentId);

    const existing = await ApplicationCourseRepository.findByIdForApplication(
      applicationId,
      id,
    );
    if (!existing) throw new NotFoundError("Course selection not found");
    if (existing.isPrimary) {
      throw new ConflictError(
        "Your primary course selection can't be withdrawn",
      );
    }

    await ApplicationCourseRepository.withdraw(id);
    await ApplicationCourseService.recalculateTotalFee(applicationId);
  }

  static async changeQuota(
    applicationId: string,
    studentId: string,
    applicationCourseId: string,
    courseQuotaSeatId: string | null,
  ) {
    const application = await assertOwnDraftApplication(
      applicationId,
      studentId,
    );

    const existing = await ApplicationCourseRepository.findByIdForApplication(
      applicationId,
      applicationCourseId,
    );
    if (!existing || existing.status === "withdrawn") {
      throw new NotFoundError("Course selection not found");
    }

    const cycleCourse =
      await ApplicationCourseRepository.findAdmissionCycleCourse(
        application.admissionCycleId,
        existing.courseId,
      );
    if (!cycleCourse) throw new NotFoundError("Course");
    const baseFee = cycleCourse.applicationFee.toNumber();

    let finalFee = baseFee;
    let resolvedQuotaSeatId: string | null = null;

    if (courseQuotaSeatId) {
      const seat = await ApplicationCourseRepository.findCourseQuotaSeat(
        courseQuotaSeatId,
        cycleCourse.id,
      );
      if (!seat) throw new NotFoundError("Quota");

      const effectiveOpenSeats = seat.seatPool
        ? seat.seatPool.openSeats
        : seat.openSeats;
      if (effectiveOpenSeats == null || effectiveOpenSeats <= 0) {
        throw new ConflictError("No seats available for this quota");
      }

      const adjustment = await ApplicationCourseRepository.findQuotaAdjustments(
        existing.courseId,
        [seat.collegeQuotaId],
      );
      finalFee = applyFeeAdjustment(
        baseFee,
        adjustment[0]?.appFeeAdjustmentType,
        adjustment[0]?.appFeeAdjustmentValue,
      );
      resolvedQuotaSeatId = seat.id;
    }

    await ApplicationCourseRepository.updateQuota(applicationCourseId, {
      applicationFee: finalFee,
      courseQuotaSeatId: resolvedQuotaSeatId,
    });
    await ApplicationCourseService.recalculateTotalFee(applicationId);

    const full = await ApplicationCourseRepository.findByIdForApplication(
      applicationId,
      applicationCourseId,
    );
    return toDto(full!);
  }

  static async recalculateTotalFee(applicationId: string) {
    const total =
      await ApplicationCourseRepository.sumActiveApplicationFees(applicationId);
    await ApplicationCourseRepository.updateApplicationTotalFee(
      applicationId,
      total,
    );
  }

  static async markAssessmentCompleted(
    applicationCourseId: string,
    publishedByStaffId: string,
  ) {
    const course =
      await ApplicationCourseRepository.findByIdWithStatus(applicationCourseId);
    if (!course) throw new NotFoundError("Application course not found");
    if (course.status === "assessment_completed") return;

    await prisma.$transaction(async (tx) => {
      await ApplicationCourseRepository.markAssessmentCompleted(
        tx,
        applicationCourseId,
      );
      await ApplicationCourseRepository.createStatusLog(tx, {
        applicationCourseId,
        fromStatus: course.status,
        toStatus: "assessment_completed",
        changedByType: "staff_member",
        changedById: publishedByStaffId,
      });
    });
  }

  static async markAssessmentCompletedForApplication(
    applicationId: string,
    publishedByStaffId: string,
  ) {
    const courses =
      await ApplicationCourseRepository.findActiveForSubmit(applicationId);
    for (const course of courses) {
      await this.markAssessmentCompleted(course.id, publishedByStaffId);
    }
  }

  static async getForStudentWithStatus(
    applicationCourseId: string,
    studentId: string,
  ) {
    const course =
      await ApplicationCourseRepository.findByIdWithOwnership(
        applicationCourseId,
      );
    if (!course || course.application.studentId !== studentId) {
      throw new NotFoundError("Application course not found");
    }
    return {
      id: course.id,
      status: course.status,
      collegeId: course.application.collegeId,
    };
  }

  static async getForOfferIssuance(applicationCourseId: string) {
    const course =
      await ApplicationCourseRepository.findByIdForOfferIssuance(
        applicationCourseId,
      );
    if (!course) throw new NotFoundError("Application course not found");
    return {
      id: course.id,
      status: course.status,
      courseId: course.courseId,
      studentId: course.application.studentId,
      collegeId: course.application.collegeId,
      admissionCycleId: course.application.admissionCycleId,
    };
  }

  static async getConfiguredTokenAmount(
    admissionCycleId: string,
    courseId: string,
  ) {
    const rows = await ApplicationRepository.findTokenAmountsForCourses(
      admissionCycleId,
      [courseId],
    );
    return rows[0]?.tokenAmount ?? null;
  }

  private static async transitionStatus(
    applicationCourseId: string,
    toStatus: string,
    changedByType: "staff_member" | "student",
    changedById: string,
  ) {
    const course =
      await ApplicationCourseRepository.findByIdWithStatus(applicationCourseId);
    if (!course) throw new NotFoundError("Application course not found");
    if (course.status === toStatus) return;

    await prisma.$transaction(async (tx) => {
      await ApplicationCourseRepository.updateStatus(
        tx,
        applicationCourseId,
        toStatus,
      );
      await ApplicationCourseRepository.createStatusLog(tx, {
        applicationCourseId,
        fromStatus: course.status,
        toStatus,
        changedByType,
        changedById,
      });
    });
  }

  static async markInterviewPending(
    applicationCourseId: string,
    studentId: string,
  ) {
    await this.transitionStatus(
      applicationCourseId,
      "interview_pending",
      "student",
      studentId,
    );
  }

  static async markInterviewCompleted(
    applicationCourseId: string,
    staffId: string,
  ) {
    await this.transitionStatus(
      applicationCourseId,
      "interview_completed",
      "staff_member",
      staffId,
    );
  }

  static async markShortlisted(applicationCourseId: string, staffId: string) {
    const course =
      await ApplicationCourseRepository.findByIdWithStatusAndCycleFlags(
        applicationCourseId,
      );
    if (!course) throw new NotFoundError("Application course not found");
    if (course.status === "shortlisted") return;

    // Mirrors the assessment-required gate: when interview isn't required
    // for this admission cycle, shortlisting is allowed straight from
    // whichever stage precedes interview (assessment_completed if the
    // assessment itself is required, else submitted).
    const cycle = course.application.admissionCycle;
    const requiredStatus = cycle.interviewRequired
      ? "interview_completed"
      : cycle.assessmentRequired
        ? "assessment_completed"
        : "submitted";
    if (course.status !== requiredStatus) {
      throw new ConflictError(
        cycle.interviewRequired
          ? "This course's interview hasn't been completed yet"
          : `This course isn't ready to be shortlisted yet (currently: ${course.status})`,
      );
    }

    await this.transitionStatus(
      applicationCourseId,
      "shortlisted",
      "staff_member",
      staffId,
    );
  }

  static async markTokenPaid(applicationCourseId: string, studentId: string) {
    const course =
      await ApplicationCourseRepository.findByIdWithStatus(applicationCourseId);
    if (!course) throw new NotFoundError("Application course not found");
    if (course.status === "token_paid") return;
    if (course.status !== "shortlisted") {
      throw new ConflictError(
        "This course must be shortlisted before the token can be paid",
      );
    }
    await this.transitionStatus(
      applicationCourseId,
      "token_paid",
      "student",
      studentId,
    );
  }
}
