import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { logger } from "@/shared/lib/logger";
import { PushService } from "@/modules/notifications/services/push.service";
import { BeaconuCardService } from "@/modules/engagement/services/beaconu-card.service";
import { SeatCancellationRepository } from "../repositories/seat-cancellation.repository";
import { ApplicationCourseRepository } from "../repositories/application-course.repository";
import { EnrollmentRepository } from "../repositories/enrollment.repository";
import type {
  RequestSeatCancellationInput,
  ReviewSeatCancellationInput,
} from "../validators/seat-cancellation.validator";

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
  };
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

    const enrollment = await EnrollmentRepository.findByApplicationCourseId(
      request.applicationCourseId,
    );
    if (!enrollment) {
      throw new ConflictError("No active enrollment linked to this seat");
    }

    const applicationCourse =
      await ApplicationCourseRepository.findByIdForEnrollment(
        request.applicationCourseId,
      );
    if (!applicationCourse) {
      throw new NotFoundError("Application course not found");
    }
    const previousStatus = applicationCourse.status;

    const approved = await prisma.$transaction(async (tx) => {
      await EnrollmentRepository.updateStatus(tx, enrollment.id, "withdrawn");
      await ApplicationCourseRepository.updateStatus(
        tx,
        request.applicationCourseId,
        "dropped_out",
      );
      await ApplicationCourseRepository.createStatusLog(tx, {
        applicationCourseId: request.applicationCourseId,
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

      await BeaconuCardService.deactivateForStudent(tx, request.studentId);

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
}
