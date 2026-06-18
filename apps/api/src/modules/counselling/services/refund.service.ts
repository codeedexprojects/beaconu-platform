import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { SessionRepository } from "../repositories/session.repository";
import { RefundRepository } from "../repositories/refund.repository";
import { istWallTimeToInstant } from "./sessions.service";
import type {
  RequestRefundInput,
  ListRefundRequestsQueryInput,
  UpdateRefundStatusInput,
} from "../validators/refund.validator";

function formatRefundRequest(r: any) {
  return {
    id: r.id,
    session_id: r.sessionId,
    amount: Number(r.amount),
    upi_id: r.upiId,
    reason: r.reason,
    proof_url: r.proofUrl,
    status: r.status,
    review_remarks: r.reviewRemarks,
    student: r.student
      ? {
          id: r.student.id,
          full_name: r.student.fullName,
          email: r.student.email,
        }
      : undefined,
    counsellor: r.counsellor
      ? {
          id: r.counsellor.id,
          full_name: r.counsellor.fullName,
          email: r.counsellor.email,
        }
      : undefined,
    session: r.session
      ? {
          id: r.session.id,
          scheduled_date: r.session.scheduledDate,
          start_time: r.session.startTime,
          end_time: r.session.endTime,
          counsellor_name: r.session.counsellor?.fullName,
        }
      : undefined,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

export class RefundService {
  static async requestRefund(
    studentId: string,
    sessionId: string,
    data: RequestRefundInput,
  ) {
    const session = await SessionRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError("Session");
    }
    if (session.studentId !== studentId) {
      throw new ForbiddenError("You do not own this session");
    }
    if (session.status === "cancelled") {
      throw new BadRequestError(
        "Cancelled sessions are refunded automatically and cannot be requested here",
      );
    }
    if (session.paymentStatus === "refunded") {
      throw new BadRequestError("This session has already been refunded");
    }
    if (session.paymentStatus !== "paid" || !session.sessionFee) {
      throw new BadRequestError("This session has no payment to refund");
    }

    const sessionEnd = istWallTimeToInstant(
      session.scheduledDate,
      session.endTime,
    );
    if (Date.now() < sessionEnd.getTime()) {
      throw new BadRequestError(
        "Refunds can only be requested after the session's scheduled meeting time has passed",
      );
    }

    const existingPending =
      await RefundRepository.findPendingBySessionId(sessionId);
    if (existingPending) {
      throw new ConflictError(
        "A refund request is already pending for this session",
      );
    }

    const created = await RefundRepository.create({
      sessionId,
      studentId,
      counsellorId: session.counsellorId,
      amount: Number(session.sessionFee),
      upiId: data.upi_id,
      reason: data.reason,
      proofUrl: data.proof_url,
    });

    return formatRefundRequest(created);
  }

  static async listMyRefundRequests(
    studentId: string,
    pagination: { page?: number; limit?: number } = {},
  ) {
    const { rows, total } = await RefundRepository.listByStudent(
      studentId,
      pagination,
    );
    return {
      data: rows.map(formatRefundRequest),
      meta: PaginationHelper.createMeta(
        total,
        pagination.page ?? 1,
        pagination.limit ?? 20,
      ),
    };
  }

  static async listAllForAdmin(query: ListRefundRequestsQueryInput) {
    const { status, page, limit } = query;
    const { rows, total } = await RefundRepository.listAll(
      { status },
      { page, limit },
    );
    return {
      data: rows.map(formatRefundRequest),
      meta: PaginationHelper.createMeta(total, page, limit),
    };
  }

  static async updateStatus(
    id: string,
    data: UpdateRefundStatusInput,
    adminId: string,
  ) {
    const request = await RefundRepository.findById(id);
    if (!request) {
      throw new NotFoundError("Refund request not found");
    }
    if (request.status !== "pending") {
      throw new ConflictError("This refund request has already been reviewed");
    }

    if (data.status === "approved") {
      await SessionRepository.debitWallet(
        request.counsellorId,
        Number(request.amount),
        request.sessionId,
        `Refund approved for session ${request.sessionId}`,
      );
      await SessionRepository.updateSession(request.sessionId, {
        paymentStatus: "refunded",
      });
    }

    const updated = await RefundRepository.updateStatus(
      id,
      data.status,
      adminId,
      data.remarks,
    );

    return formatRefundRequest(updated);
  }
}
