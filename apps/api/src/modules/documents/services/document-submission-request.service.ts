import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
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

export class DocumentSubmissionRequestService {
  static async create(
    collegeId: string,
    requestedBy: string,
    data: CreateSubmissionRequestInput,
  ) {
    return DocumentSubmissionRequestRepository.create(
      collegeId,
      requestedBy,
      data,
      [historyEntry("pending", requestedBy)],
    );
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

    return DocumentSubmissionRequestRepository.review(
      id,
      reviewedBy,
      data.status,
      data.rejection_reason ?? null,
      appendHistory(
        request.statusHistory,
        historyEntry(data.status, reviewedBy),
      ),
    );
  }
}
