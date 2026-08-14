import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { logger } from "@/shared/lib/logger";
import { PushService } from "@/modules/notifications/services/push.service";
import { EnrollmentService } from "@/modules/admissions/services/enrollment.service";
import { DocumentSubmissionRequestRepository } from "../repositories/document-submission-request.repository";
import type {
  CreateSubmissionRequestInput,
  SubmitDocumentInput,
  ReviewSubmissionInput,
} from "../validators/documents.validator";

const SUBMITTABLE_STATUSES = ["pending", "rejected"];

function historyEntry(status: string, changedBy: string | null) {
  return { status, changedAt: new Date().toISOString(), changedBy };
}

function appendHistory(existing: unknown, entry: Record<string, unknown>) {
  return [...(Array.isArray(existing) ? existing : []), entry];
}

async function notifyStudentOfNewRequest(request: {
  id: string;
  studentId: string;
  documentName: string;
  deadline: Date;
}): Promise<void> {
  try {
    await PushService.sendToUser(request.studentId, "student", {
      title: "Document requested",
      body: `Your college has requested "${request.documentName}" — due ${request.deadline.toISOString().split("T")[0]}`,
      data: { type: "document_submission_requested", requestId: request.id },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: request.id },
      "Failed to notify student of new document submission request",
    );
  }
}

async function notifyStudentOfReview(
  request: { id: string; studentId: string; documentName: string },
  status: "verified" | "rejected",
  rejectionReason: string | null,
): Promise<void> {
  try {
    await PushService.sendToUser(request.studentId, "student", {
      title: status === "verified" ? "Document verified" : "Document rejected",
      body:
        status === "verified"
          ? `"${request.documentName}" has been verified`
          : `"${request.documentName}" was rejected${rejectionReason ? `: ${rejectionReason}` : ""}`,
      data: {
        type:
          status === "verified"
            ? "document_submission_verified"
            : "document_submission_rejected",
        requestId: request.id,
      },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: request.id },
      "Failed to notify student of document submission review",
    );
  }
}

export class DocumentSubmissionRequestService {
  static async countUnderReview(collegeId: string) {
    return DocumentSubmissionRequestRepository.countUnderReviewForCollege(
      collegeId,
    );
  }

  static async create(
    collegeId: string,
    requestedBy: string,
    data: CreateSubmissionRequestInput,
  ) {
    if (data.target === "all") {
      const studentIds =
        await EnrollmentService.listStudentIdsForCollege(collegeId);
      if (studentIds.length === 0) {
        throw new ConflictError("No enrolled students at this college yet");
      }

      const requests = await DocumentSubmissionRequestRepository.createMany(
        collegeId,
        requestedBy,
        studentIds,
        data,
        [historyEntry("pending", requestedBy)],
      );
      await Promise.all(
        requests.map((request) => notifyStudentOfNewRequest(request)),
      );
      return requests;
    }

    const request = await DocumentSubmissionRequestRepository.create(
      collegeId,
      requestedBy,
      // Guaranteed present by createSubmissionRequestSchema's refine when
      // target !== "all" (the branch above already returned otherwise).
      data.student_id as string,
      data,
      [historyEntry("pending", requestedBy)],
    );
    await notifyStudentOfNewRequest(request);
    return request;
  }

  static async submit(
    id: string,
    studentId: string,
    data: SubmitDocumentInput,
  ) {
    const request = await DocumentSubmissionRequestRepository.findById(id);
    if (!request) throw new NotFoundError("Document request not found");
    if (request.studentId !== studentId) {
      throw new ForbiddenError("Not your document request");
    }
    if (!SUBMITTABLE_STATUSES.includes(request.status)) {
      throw new ConflictError(
        `Cannot submit a document for a request with status '${request.status}'`,
      );
    }

    return DocumentSubmissionRequestRepository.submitDocument(
      id,
      {
        fileUrl: data.file_url,
        fileName: data.file_name ?? null,
        fileSizeBytes: data.file_size_bytes ?? null,
      },
      appendHistory(request.statusHistory, historyEntry("under_review", null)),
    );
  }

  static async review(
    id: string,
    collegeId: string,
    reviewedBy: string,
    data: ReviewSubmissionInput,
  ) {
    const request = await DocumentSubmissionRequestRepository.findById(id);
    if (!request) throw new NotFoundError("Document request not found");
    if (request.collegeId !== collegeId) {
      throw new NotFoundError("Document request not found");
    }
    if (request.status !== "under_review") {
      throw new ConflictError(
        `Cannot review a request with status '${request.status}'`,
      );
    }

    const reviewed = await DocumentSubmissionRequestRepository.review(
      id,
      reviewedBy,
      data.status,
      data.rejection_reason ?? null,
      appendHistory(
        request.statusHistory,
        historyEntry(data.status, reviewedBy),
      ),
    );
    await notifyStudentOfReview(
      reviewed,
      data.status,
      data.rejection_reason ?? null,
    );
    return reviewed;
  }
}
