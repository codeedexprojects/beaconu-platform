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

/** Bidirectional: positive appFeeAdjustmentValue surcharges the base fee
 * (e.g. NRI Quota), negative discounts it — mirrors CourseQuota's semantics.
 * Clamped at 0 so a discount can never push the fee negative. */
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

/** Courses/quota are freely editable while the student is still building
 * up their application (primary + any extra courses, each with a
 * preference order) — the whole set gets paid for together in one order.
 * requireNotLocked defaults to true for every course-mutating call
 * (add, withdraw, change quota); it locks the instant a payment order
 * exists (pending or completed — see isPaymentLocked's doc comment), even
 * before that order is confirmed, so the total can't shift out from under
 * a payment already in flight. Read-only calls (list) pass false. */
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
    // A brand-new application (Start Application creating the primary
    // course) can never already be payment-locked — nothing to check yet
    // — so this is just the normal gate, no special-casing needed.
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

    // Cross-application guard (Plan N, broadened in Plan R to the whole
    // college): the student may have a *different* Application at this
    // college that already has this course active — a course can only
    // ever be live in one of a student's applications at a college at a
    // time, regardless of cycle.
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

      // Availability check only — not a reservation. Seats are decremented
      // atomically at final submit, with a re-check at that point, so an
      // abandoned draft never holds a seat hostage.
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

  /** Changes the quota (and recomputes the fee) on a course already added
   * to the application — including the primary course, which can have its
   * quota revised even though it can't be withdrawn. Locked the same as
   * every other course mutation once a payment order exists. */
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

  /** Called from the assessments module (evaluation.service.ts) once an
   * attempt's result is published — via this service, never its
   * repository, per the "modules talk via services only" rule. */
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

  /** Fan-out entry point for the assessments module — one AssessmentAttempt
   * now covers the whole Application (every course listed on it), so
   * publishing a result marks every one of its active (non-withdrawn)
   * courses, not just one. Reuses the existing per-course
   * markAssessmentCompleted (and its own idempotency check) for each. */
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

  /** Cross-module ownership + status read — used by the `interviews`
   * module (never touches this module's repository directly, per the
   * "modules talk via services only" rule) to verify a student owns an
   * ApplicationCourse before booking/rescheduling against it. */
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

  /** Called by interviews/services/interview-booking.service.ts the first
   * time a student successfully books a slot for this course — idempotent
   * no-op if already at/past this stage (e.g. re-booking after a
   * cancellation). */
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

  /** Called once an evaluator records the interview's outcome. */
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

  /** Shortlisting is its own explicit staff action, only meaningful once
   * the interview is done — no OfferLetter/token payment triggered here
   * (deferred to a later feature). */
  static async markShortlisted(applicationCourseId: string, staffId: string) {
    const course =
      await ApplicationCourseRepository.findByIdWithStatus(applicationCourseId);
    if (!course) throw new NotFoundError("Application course not found");
    if (course.status === "shortlisted") return;
    if (course.status !== "interview_completed") {
      throw new ConflictError(
        "This course's interview hasn't been completed yet",
      );
    }
    await this.transitionStatus(
      applicationCourseId,
      "shortlisted",
      "staff_member",
      staffId,
    );
  }
}
