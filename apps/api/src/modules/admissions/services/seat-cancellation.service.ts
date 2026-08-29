import { prisma, Prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { logger } from "@/shared/lib/logger";
import { PushService } from "@/modules/notifications/services/push.service";
import { BeaconuCardService } from "@/modules/engagement/services/beaconu-card.service";
import { createMeetEvent, isGoogleMeetReady } from "@/shared/lib/google-meet";
import { SeatCancellationRepository } from "../repositories/seat-cancellation.repository";
import { ApplicationCourseRepository } from "../repositories/application-course.repository";
import { EnrollmentRepository } from "../repositories/enrollment.repository";
import type {
  RequestSeatCancellationInput,
  ReviewSeatCancellationInput,
  SubmitInitiationInput,
  ScheduleCounselingInput,
  SubmitCounselingOutcomeInput,
  SubmitSettlementInput,
  FinalClearanceInput,
} from "../validators/seat-cancellation.validator";

const COUNSELING_SESSION_DURATION_MINS = 30;

// Naive local-time ISO string (no offset) — paired with timeZone: "Asia/Kolkata"
// on the Calendar API call, same convention as the interview module's own
// gmeet integration (apps/api/src/modules/interviews/services/interview-slot.service.ts).
function toNaiveISODateTime(date: Date): string {
  return date.toISOString().slice(0, 19);
}

async function notifyStudentOfReview(
  studentId: string,
  courseName: string,
  decision: "approve" | "reject",
): Promise<void> {
  try {
    await PushService.sendToUser(studentId, "student", {
      title:
        decision === "approve"
          ? "Seat cancellation approved"
          : "Seat cancellation rejected",
      body:
        decision === "approve"
          ? `Your seat cancellation for ${courseName} has been approved.`
          : `Your seat cancellation request for ${courseName} was rejected.`,
      data: {
        type:
          decision === "approve"
            ? "seat_cancellation_approved"
            : "seat_cancellation_rejected",
      },
    });
  } catch (error) {
    logger.error(
      { err: error, studentId },
      "Failed to notify student of seat cancellation review",
    );
  }
}

function mapRequest(row: {
  id: string;
  applicationCourseId: string;
  studentId: string;
  reason: string;
  supportingDocUrls: unknown;
  status: string;
  refundAmount: { toString(): string } | null;
  refundStatus: string | null;
  processedBy: string | null;
  remarks: string | null;
  requestedAt: Date;
  processedAt: Date | null;
  applicationCourse: {
    course: { name: string; code: string };
    application: { collegeId: string };
  };
  student?: { fullName: string; email: string | null };
  currentPhase?: number;
  caseType?: string | null;
  scheduledAt?: Date | null;
  meetingUrl?: string | null;
}) {
  return {
    id: row.id,
    applicationCourseId: row.applicationCourseId,
    studentId: row.studentId,
    studentName: row.student?.fullName ?? null,
    studentEmail: row.student?.email ?? null,
    courseName: row.applicationCourse.course.name,
    courseCode: row.applicationCourse.course.code,
    collegeId: row.applicationCourse.application.collegeId,
    reason: row.reason,
    supportingDocUrls: (row.supportingDocUrls ?? []) as string[],
    status: row.status,
    refundAmount: row.refundAmount ? row.refundAmount.toString() : null,
    refundStatus: row.refundStatus,
    processedBy: row.processedBy,
    remarks: row.remarks,
    requestedAt: row.requestedAt.toISOString(),
    processedAt: row.processedAt ? row.processedAt.toISOString() : null,
    currentPhase: row.currentPhase ?? 1,
    caseType: (row.caseType ?? null) as "A" | "B" | "C" | null,
    scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : null,
    meetingUrl: row.meetingUrl ?? null,
  };
}

function mapDetail(row: {
  id: string;
  applicationCourseId: string;
  studentId: string;
  reason: string;
  supportingDocUrls: unknown;
  status: string;
  refundAmount: { toString(): string } | null;
  refundStatus: string | null;
  processedBy: string | null;
  remarks: string | null;
  requestedAt: Date;
  processedAt: Date | null;
  applicationCourse: {
    course: { name: string; code: string };
    application: { collegeId: string };
  };
  student?: { fullName: string; email: string | null };
  effectiveDate: Date | null;
  lastSemester: string | null;
  currentPhase: number;
  counselorId: string | null;
  counselor: { fullName: string } | null;
  scheduledAt: Date | null;
  counselingCompletedAt: Date | null;
  counselingNotes: string | null;
  counselingOutcome: string | null;
  suggestedCaseType: string | null;
  caseType: string | null;
  refundCalculationMethod: string | null;
  refundCalculationValue: { toString(): string } | null;
  penaltyAmount: { toString(): string } | null;
  penaltyPaidAt: Date | null;
  settledAt: Date | null;
  refundTransactionRef: string | null;
  refundPaymentMethod: string | null;
  refundProcessedAt: Date | null;
  documentsHandedOverAt: Date | null;
  phaseLogs: {
    id: string;
    phase: number;
    action: string;
    createdAt: Date;
    performer: { fullName: string };
  }[];
}) {
  return {
    ...mapRequest(row),
    effectiveDate: row.effectiveDate ? row.effectiveDate.toISOString() : null,
    lastSemester: row.lastSemester,
    currentPhase: row.currentPhase,
    counselorId: row.counselorId,
    counselorName: row.counselor?.fullName ?? null,
    scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : null,
    counselingCompletedAt: row.counselingCompletedAt
      ? row.counselingCompletedAt.toISOString()
      : null,
    counselingNotes: row.counselingNotes,
    counselingOutcome: row.counselingOutcome as
      | "transfer"
      | "termination"
      | null,
    suggestedCaseType: row.suggestedCaseType as "A" | "B" | "C" | null,
    caseType: row.caseType as "A" | "B" | "C" | null,
    refundCalculationMethod: row.refundCalculationMethod as
      | "percentage"
      | "fixed"
      | null,
    refundCalculationValue: row.refundCalculationValue
      ? row.refundCalculationValue.toString()
      : null,
    penaltyAmount: row.penaltyAmount ? row.penaltyAmount.toString() : null,
    penaltyPaidAt: row.penaltyPaidAt ? row.penaltyPaidAt.toISOString() : null,
    settledAt: row.settledAt ? row.settledAt.toISOString() : null,
    refundTransactionRef: row.refundTransactionRef,
    refundPaymentMethod: row.refundPaymentMethod,
    refundProcessedAt: row.refundProcessedAt
      ? row.refundProcessedAt.toISOString()
      : null,
    documentsHandedOverAt: row.documentsHandedOverAt
      ? row.documentsHandedOverAt.toISOString()
      : null,
    phaseLogs: row.phaseLogs.map((log) => ({
      id: log.id,
      phase: log.phase,
      action: log.action,
      performedByName: log.performer.fullName,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}

async function loadOwnedDetail(collegeId: string, id: string) {
  const row = await SeatCancellationRepository.findDetailById(id);
  if (!row || row.applicationCourse.application.collegeId !== collegeId) {
    throw new NotFoundError("Cancellation request not found");
  }
  return row;
}

export class SeatCancellationService {
  static async request(studentId: string, data: RequestSeatCancellationInput) {
    const applicationCourse =
      await ApplicationCourseRepository.findByIdWithOwnership(
        data.application_course_id,
      );
    if (
      !applicationCourse ||
      applicationCourse.application.studentId !== studentId
    ) {
      throw new NotFoundError("Application course not found");
    }

    const enrollment = await EnrollmentRepository.findByApplicationCourseId(
      data.application_course_id,
    );
    if (!enrollment || enrollment.status !== "active") {
      throw new ConflictError(
        "No confirmed, active seat to cancel for this course",
      );
    }

    const pending =
      await SeatCancellationRepository.findPendingForApplicationCourse(
        data.application_course_id,
      );
    if (pending) {
      throw new ConflictError(
        "You already have a pending cancellation request for this seat",
      );
    }

    const created = await SeatCancellationRepository.create({
      applicationCourseId: data.application_course_id,
      studentId,
      reason: data.reason,
      supportingDocUrls: data.supporting_doc_urls ?? [],
    });
    return mapRequest(created);
  }

  static async listMine(studentId: string) {
    const rows = await SeatCancellationRepository.listForStudent(studentId);
    return rows.map(mapRequest);
  }

  static async listForCollege(
    collegeId: string,
    filters: { status?: string },
    pagination: { page: number; limit: number },
  ) {
    const { rows, total } = await SeatCancellationRepository.listForCollege(
      collegeId,
      filters,
      pagination,
    );
    return {
      requests: rows.map(mapRequest),
      meta: PaginationHelper.createMeta(
        total,
        pagination.page,
        pagination.limit,
      ),
    };
  }

  static async countPending(collegeId: string) {
    return SeatCancellationRepository.countPendingForCollege(collegeId);
  }

  static async getForCollege(collegeId: string, id: string) {
    const row = await loadOwnedDetail(collegeId, id);
    return mapDetail(row);
  }

  static async review(
    collegeId: string,
    staffId: string,
    requestId: string,
    data: ReviewSeatCancellationInput,
  ) {
    const request = await SeatCancellationRepository.findById(requestId);
    if (
      !request ||
      request.applicationCourse.application.collegeId !== collegeId
    ) {
      throw new NotFoundError("Seat cancellation request not found");
    }
    if (request.status !== "pending") {
      throw new ConflictError(
        `This request has already been ${request.status}`,
      );
    }

    if (data.decision === "reject") {
      const rejected = await SeatCancellationRepository.reject(
        requestId,
        staffId,
        data.remarks ?? null,
      );
      await notifyStudentOfReview(
        request.studentId,
        request.applicationCourse.course.name,
        "reject",
      );
      return mapRequest(rejected);
    }

    const approved = await prisma.$transaction(async (tx) => {
      await SeatCancellationService.finalizeSeatWithdrawal(
        tx,
        request.applicationCourseId,
        request.studentId,
        staffId,
      );
      return SeatCancellationRepository.approve(tx, requestId, {
        processedBy: staffId,
        remarks: data.remarks ?? null,
        refundAmount: data.refund_amount ?? null,
        refundStatus: data.refund_status ?? null,
      });
    });

    await notifyStudentOfReview(
      request.studentId,
      request.applicationCourse.course.name,
      "approve",
    );

    return mapRequest(approved);
  }

  // Shared by both the legacy one-shot review(approve) and the new
  // 5-phase flow's final-clearance step — withdraws the enrollment,
  // flips the course status, releases the seat, deactivates the card.
  private static async finalizeSeatWithdrawal(
    tx: Prisma.TransactionClient,
    applicationCourseId: string,
    studentId: string,
    staffId: string,
  ) {
    const enrollment =
      await EnrollmentRepository.findByApplicationCourseId(applicationCourseId);
    if (!enrollment) {
      throw new ConflictError("No active enrollment linked to this seat");
    }

    const applicationCourse =
      await ApplicationCourseRepository.findByIdForEnrollment(
        applicationCourseId,
      );
    if (!applicationCourse) {
      throw new NotFoundError("Application course not found");
    }
    const previousStatus = applicationCourse.status;

    await EnrollmentRepository.updateStatus(tx, enrollment.id, "withdrawn");
    await ApplicationCourseRepository.updateStatus(
      tx,
      applicationCourseId,
      "dropped_out",
    );
    await ApplicationCourseRepository.createStatusLog(tx, {
      applicationCourseId,
      fromStatus: previousStatus,
      toStatus: "dropped_out",
      changedByType: "staff_member",
      changedById: staffId,
    });

    if (applicationCourse.courseQuotaSeatId) {
      const seatLink = await ApplicationCourseRepository.findSeatPoolLink(
        tx,
        applicationCourse.courseQuotaSeatId,
      );
      if (seatLink?.seatPoolId) {
        await ApplicationCourseRepository.incrementPoolSeat(
          tx,
          seatLink.seatPoolId,
        );
      } else {
        await ApplicationCourseRepository.incrementExclusiveSeat(
          tx,
          applicationCourse.courseQuotaSeatId,
        );
      }
    }

    await BeaconuCardService.deactivateForStudent(tx, studentId);
  }

  // --- Phase-based case flow (college-admin only) ---

  static async submitInitiation(
    collegeId: string,
    staffId: string,
    id: string,
    data: SubmitInitiationInput,
  ) {
    const row = await loadOwnedDetail(collegeId, id);
    if (row.currentPhase !== 1) {
      throw new ConflictError("This case is not at the Initiation phase");
    }

    const updated = await SeatCancellationRepository.submitInitiation(id, {
      effectiveDate: data.effective_date,
      lastSemester: data.last_semester,
    });
    await SeatCancellationRepository.addPhaseLog(prisma, {
      seatCancellationId: id,
      phase: 1,
      action: "initiation_recorded",
      performedBy: staffId,
    });
    return mapDetail(updated);
  }

  // Best-effort: never throws — scheduling must succeed even if Calendar/
  // Meet is unavailable or not configured for this environment. Mirrors
  // InterviewSlotService.ensureMeetEvent's exact error-handling shape.
  private static async tryCreateCounselingMeetEvent(params: {
    studentName: string;
    counselorName: string;
    counselorEmail: string;
    studentEmail: string | null;
    scheduledAt: Date;
  }) {
    if (!isGoogleMeetReady()) return null;

    try {
      const endAt = new Date(
        params.scheduledAt.getTime() +
          COUNSELING_SESSION_DURATION_MINS * 60_000,
      );
      const attendeeEmails = Array.from(
        new Set(
          [params.counselorEmail, params.studentEmail].filter(
            (email): email is string => !!email,
          ),
        ),
      );

      return await createMeetEvent({
        summary: `Exit Counseling — ${params.studentName}`,
        description: `Mandatory exit counseling session with ${params.counselorName} regarding a seat cancellation request.`,
        startDateTime: toNaiveISODateTime(params.scheduledAt),
        endDateTime: toNaiveISODateTime(endAt),
        attendeeEmails,
      });
    } catch (error) {
      logger.error(
        { err: error },
        "Failed to create Google Meet event for counseling session",
      );
      return null;
    }
  }

  static async scheduleCounseling(
    collegeId: string,
    staffId: string,
    id: string,
    data: ScheduleCounselingInput,
  ) {
    const row = await loadOwnedDetail(collegeId, id);
    if (row.currentPhase !== 2) {
      throw new ConflictError(
        "This case is not at the Schedule Counseling phase",
      );
    }

    const counselor = await SeatCancellationRepository.findStaffInCollege(
      data.counselor_id,
      collegeId,
    );
    if (!counselor) {
      throw new NotFoundError("Counselor not found at this college");
    }

    const meetEvent = await this.tryCreateCounselingMeetEvent({
      studentName: row.student?.fullName ?? "Student",
      counselorName: counselor.fullName,
      counselorEmail: counselor.email,
      studentEmail: row.student?.email ?? null,
      scheduledAt: data.scheduled_at,
    });

    const updated = await SeatCancellationRepository.scheduleCounseling(id, {
      counselorId: data.counselor_id,
      scheduledAt: data.scheduled_at,
      meetingUrl: meetEvent?.meetingUrl ?? null,
      meetingId: meetEvent?.meetingId ?? null,
      googleEventId: meetEvent?.eventId ?? null,
    });
    await SeatCancellationRepository.addPhaseLog(prisma, {
      seatCancellationId: id,
      phase: 2,
      action: "counseling_scheduled",
      performedBy: staffId,
    });
    return mapDetail(updated);
  }

  static async submitCounselingOutcome(
    collegeId: string,
    staffId: string,
    id: string,
    data: SubmitCounselingOutcomeInput,
  ) {
    const row = await loadOwnedDetail(collegeId, id);
    if (row.currentPhase !== 3) {
      throw new ConflictError(
        "This case is not at the Counseling Outcome phase",
      );
    }

    // Automatic default per the confirmed rule: Transfer -> suggest Case B.
    // Termination has no fixed rule (staff freely picks Case A or C in the
    // next phase) — so no suggestion is set for that outcome.
    const suggestedCaseType = data.outcome === "transfer" ? "B" : null;

    const updated = await SeatCancellationRepository.submitCounselingOutcome(
      id,
      {
        notes: data.notes ?? null,
        outcome: data.outcome,
        suggestedCaseType,
      },
    );
    await SeatCancellationRepository.addPhaseLog(prisma, {
      seatCancellationId: id,
      phase: 3,
      action: "outcome_submitted",
      performedBy: staffId,
    });
    return mapDetail(updated);
  }

  static async submitSettlement(
    collegeId: string,
    staffId: string,
    id: string,
    data: SubmitSettlementInput,
  ) {
    const row = await loadOwnedDetail(collegeId, id);
    if (row.currentPhase !== 4) {
      throw new ConflictError("This case is not at the Settlement phase");
    }

    let refundAmount: number | null = null;
    let penaltyAmount: number | null = null;
    let penaltyPaidAt: Date | null = null;

    if (data.case_type === "A") {
      penaltyAmount = data.penalty_amount ?? 0;
      // "Record Penalty Payment" is the same submit action — recorded paid
      // immediately, matching the mockup's single-step button.
      penaltyPaidAt = new Date();
    } else if (data.case_type === "B") {
      if (data.refund_calculation_method === "fixed") {
        refundAmount = data.refund_calculation_value ?? 0;
      } else {
        // Percentage is computed against the course's application fee — the
        // only fee figure already known on this row. Flagged as an
        // assumption: confirm the intended base if this should instead be
        // the token/tuition fee actually paid.
        const applicationCourse =
          await SeatCancellationRepository.findApplicationFee(
            row.applicationCourseId,
          );
        const base = applicationCourse
          ? Number(applicationCourse.applicationFee)
          : 0;
        refundAmount = (base * (data.refund_calculation_value ?? 0)) / 100;
      }
    }
    // case_type "C" — no penalty, no refund.

    const updated = await SeatCancellationRepository.submitSettlement(id, {
      caseType: data.case_type,
      penaltyAmount,
      penaltyPaidAt,
      refundCalculationMethod: data.refund_calculation_method ?? null,
      refundCalculationValue: data.refund_calculation_value ?? null,
      refundAmount,
    });
    await SeatCancellationRepository.addPhaseLog(prisma, {
      seatCancellationId: id,
      phase: 4,
      action: "settlement_recorded",
      performedBy: staffId,
    });
    return mapDetail(updated);
  }

  static async finalClearance(
    collegeId: string,
    staffId: string,
    id: string,
    data: FinalClearanceInput,
  ) {
    const row = await loadOwnedDetail(collegeId, id);
    if (row.currentPhase !== 5) {
      throw new ConflictError("This case is not at the Final Clearance phase");
    }
    if (row.caseType === "B" && !data.refund_transaction_ref) {
      throw new ConflictError(
        "A refund transaction reference is required to clear a Case B settlement",
      );
    }

    const finalized = await prisma.$transaction(async (tx) => {
      await SeatCancellationService.finalizeSeatWithdrawal(
        tx,
        row.applicationCourseId,
        row.studentId,
        staffId,
      );
      return SeatCancellationRepository.finalizeClearance(tx, id, {
        processedBy: staffId,
        refundTransactionRef:
          row.caseType === "B" ? (data.refund_transaction_ref ?? null) : null,
        refundPaymentMethod:
          row.caseType === "B" ? (data.refund_payment_method ?? null) : null,
        refundProcessedAt: row.caseType === "B" ? new Date() : null,
        refundStatus: row.caseType === "B" ? "processed" : "not_applicable",
      });
    });

    await SeatCancellationRepository.addPhaseLog(prisma, {
      seatCancellationId: id,
      phase: 5,
      action: "final_clearance_recorded",
      performedBy: staffId,
    });
    await notifyStudentOfReview(
      row.studentId,
      row.applicationCourse.course.name,
      "approve",
    );

    return mapDetail(finalized);
  }
}
