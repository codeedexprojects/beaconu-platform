import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/shared/errors";
import { logger } from "@/shared/lib/logger";
import { PushService } from "@/modules/notifications/services/push.service";
import { ApplicationService } from "@/modules/admissions/services/application.service";
import { DocumentRequestRepository } from "../repositories/document-request.repository";
import { DocumentTemplateRepository } from "../repositories/document-template.repository";
import type {
  CreateDocumentRequestInput,
  IssueDocumentRequestInput,
  RejectDocumentRequestInput,
  ResubmitDocumentRequestInput,
} from "../validators/documents.validator";

function historyEntry(status: string, changedBy: string | null) {
  return { status, changedAt: new Date().toISOString(), changedBy };
}

function appendHistory(existing: unknown, entry: Record<string, unknown>) {
  return [...(Array.isArray(existing) ? existing : []), entry];
}

async function notifyStudentOfRejection(request: {
  id: string;
  studentId: string;
  documentName: string;
}): Promise<void> {
  try {
    await PushService.sendToUser(request.studentId, "student", {
      title: "Document request rejected",
      body: `Your request for "${request.documentName}" was rejected`,
      data: { type: "document_request_rejected", requestId: request.id },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: request.id },
      "Failed to notify student of document request rejection",
    );
  }
}

async function notifyStudentOfIssue(request: {
  id: string;
  studentId: string;
  documentName: string;
  deliveryMode: string;
}): Promise<void> {
  try {
    const isPickup = request.deliveryMode === "pickup";
    await PushService.sendToUser(request.studentId, "student", {
      title: "Document ready",
      body: isPickup
        ? `"${request.documentName}" is ready for pickup at the college office`
        : `"${request.documentName}" is ready to download`,
      data: { type: "document_request_issued", requestId: request.id },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: request.id },
      "Failed to notify student of document issue",
    );
  }
}

export class DocumentRequestService {
  static async create(
    studentId: string,
    collegeId: string,
    data: CreateDocumentRequestInput,
  ) {
    const hasApplication = await ApplicationService.hasApplicationAtCollege(
      studentId,
      collegeId,
    );
    if (!hasApplication) {
      throw new ForbiddenError("You don't have an application at this college");
    }

    let resolvedDocumentName = data.document_name;

    if (data.document_template_id) {
      const template = await DocumentTemplateRepository.findById(
        data.document_template_id,
      );
      if (!template || template.collegeId !== collegeId || !template.isActive) {
        throw new NotFoundError("Document template not found");
      }
      resolvedDocumentName = resolvedDocumentName ?? template.name;
    }

    if (!resolvedDocumentName) {
      throw new ValidationError(
        "Either document_template_id or document_name is required",
      );
    }

    return DocumentRequestRepository.create(
      studentId,
      collegeId,
      data,
      resolvedDocumentName,
      [historyEntry("submitted", null)],
    );
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

    const resubmissionHistoryEntry = {
      rejectionReason: request.rejectionReason,
      rejectedAt: request.updatedAt.toISOString(),
      resubmittedAt: new Date().toISOString(),
      previousValues: {
        documentName: request.documentName,
        description: request.description,
        deliveryMode: request.deliveryMode,
      },
    };
    const existingResubmissionHistory = Array.isArray(
      request.resubmissionHistory,
    )
      ? request.resubmissionHistory
      : [];

    return DocumentRequestRepository.resubmit(
      id,
      {
        documentName: data.document_name,
        description: data.description,
        deliveryMode: data.delivery_mode,
      },
      resubmissionHistoryEntry,
      request.resubmissionCount + 1,
      existingResubmissionHistory,
      appendHistory(request.statusHistory, historyEntry("submitted", null)),
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
      appendHistory(
        request.statusHistory,
        historyEntry("processing", processedBy),
      ),
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
      appendHistory(
        request.statusHistory,
        historyEntry("awaiting_approval", processedBy),
      ),
    );
  }

  static async approve(id: string, collegeId: string, processedBy: string) {
    const request = await this.loadForCollege(id, collegeId);
    if (request.status !== "awaiting_approval") {
      throw new ConflictError(
        `Cannot approve a request with status '${request.status}'`,
      );
    }
    return DocumentRequestRepository.updateStatus(
      id,
      "approved",
      processedBy,
      appendHistory(
        request.statusHistory,
        historyEntry("approved", processedBy),
      ),
    );
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

    const rejected = await DocumentRequestRepository.reject(
      id,
      processedBy,
      data.rejection_reason,
      appendHistory(
        request.statusHistory,
        historyEntry("rejected", processedBy),
      ),
    );
    await notifyStudentOfRejection(rejected);
    return rejected;
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
    if (request.deliveryMode === "pickup") {
      if (!data.pickup_instructions || !data.office_contact_phone) {
        throw new ValidationError(
          "pickup_instructions and office_contact_phone are required when delivery mode is 'pickup'",
        );
      }
    }

    const { request: updatedRequest, issued } =
      await DocumentRequestRepository.issue(
        id,
        processedBy,
        {
          documentUrl: data.document_url,
          fileName: data.file_name ?? null,
          fileSizeBytes: data.file_size_bytes ?? null,
          pickupInstructions: data.pickup_instructions ?? null,
          officeContactPhone: data.office_contact_phone ?? null,
        },
        appendHistory(
          request.statusHistory,
          historyEntry("issued", processedBy),
        ),
      );
    await notifyStudentOfIssue(updatedRequest);
    return issued;
  }
}
