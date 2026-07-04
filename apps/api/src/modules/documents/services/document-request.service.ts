import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { DocumentRequestRepository } from "../repositories/document-request.repository";
import type {
  CreateDocumentRequestInput,
  IssueDocumentRequestInput,
  RejectDocumentRequestInput,
  ResubmitDocumentRequestInput,
} from "../validators/documents.validator";

export class DocumentRequestService {
  static async create(
    studentId: string,
    collegeId: string,
    data: CreateDocumentRequestInput,
  ) {
    return DocumentRequestRepository.create(studentId, collegeId, data);
  }

  static async resubmit(
    id: string,
    studentId: string,
    data: ResubmitDocumentRequestInput,
  ) {
    const request = await DocumentRequestRepository.findById(id);
    if (!request) throw new NotFoundError("Document request not found");
    if (request.studentId !== studentId) {
      throw new ForbiddenError("You cannot resubmit this request");
    }
    if (request.status !== "rejected") {
      throw new ConflictError(
        `Only a rejected request can be resubmitted (current status: '${request.status}')`,
      );
    }

    const historyEntry = {
      rejectionReason: request.rejectionReason,
      rejectedAt: request.updatedAt.toISOString(),
      resubmittedAt: new Date().toISOString(),
      previousValues: {
        documentName: request.documentName,
        description: request.description,
        deliveryMode: request.deliveryMode,
      },
    };
    const existingHistory = Array.isArray(request.resubmissionHistory)
      ? request.resubmissionHistory
      : [];

    return DocumentRequestRepository.resubmit(
      id,
      {
        documentName: data.document_name,
        description: data.description,
        deliveryMode: data.delivery_mode,
      },
      historyEntry,
      request.resubmissionCount + 1,
      existingHistory,
    );
  }

  private static readonly REJECTABLE_STATUSES = [
    "submitted",
    "processing",
    "awaiting_approval",
  ];

  private static async loadForCollege(id: string, collegeId: string) {
    const request = await DocumentRequestRepository.findById(id);
    if (!request) throw new NotFoundError("Document request not found");
    if (request.collegeId !== collegeId) {
      throw new NotFoundError("Document request not found");
    }
    return request;
  }

  static async startReview(id: string, collegeId: string, processedBy: string) {
    const request = await this.loadForCollege(id, collegeId);
    if (request.status !== "submitted") {
      throw new ConflictError(
        `Cannot start review on a request with status '${request.status}'`,
      );
    }
    return DocumentRequestRepository.updateStatus(
      id,
      "processing",
      processedBy,
    );
  }

  static async sendForApproval(
    id: string,
    collegeId: string,
    processedBy: string,
  ) {
    const request = await this.loadForCollege(id, collegeId);
    if (request.status !== "processing") {
      throw new ConflictError(
        `Cannot send for approval a request with status '${request.status}'`,
      );
    }
    return DocumentRequestRepository.updateStatus(
      id,
      "awaiting_approval",
      processedBy,
    );
  }

  static async approve(id: string, collegeId: string, processedBy: string) {
    const request = await this.loadForCollege(id, collegeId);
    if (request.status !== "awaiting_approval") {
      throw new ConflictError(
        `Cannot approve a request with status '${request.status}'`,
      );
    }
    return DocumentRequestRepository.updateStatus(id, "approved", processedBy);
  }

  static async reject(
    id: string,
    collegeId: string,
    processedBy: string,
    data: RejectDocumentRequestInput,
  ) {
    const request = await this.loadForCollege(id, collegeId);
    if (!this.REJECTABLE_STATUSES.includes(request.status)) {
      throw new ConflictError(
        `Cannot reject a request with status '${request.status}'`,
      );
    }

    return DocumentRequestRepository.reject(
      id,
      processedBy,
      data.rejection_reason,
    );
  }

  static async issue(
    id: string,
    collegeId: string,
    processedBy: string,
    data: IssueDocumentRequestInput,
  ) {
    const request = await this.loadForCollege(id, collegeId);
    if (request.status !== "approved") {
      throw new ConflictError(
        `Cannot issue a document for a request with status '${request.status}'`,
      );
    }

    const { issued } = await DocumentRequestRepository.issue(id, processedBy, {
      documentUrl: data.document_url,
      fileName: data.file_name ?? null,
      fileSizeBytes: data.file_size_bytes ?? null,
    });
    return issued;
  }
}
