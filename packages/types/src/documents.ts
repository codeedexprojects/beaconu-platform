import type { PaginationMeta } from "./api";
import type { DocumentRequestStatus } from "./enums";

export type DocumentSubmissionStatus =
  | "pending"
  | "under_review"
  | "verified"
  | "rejected";

export interface DocumentRequestPartyStudent {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
}

export interface DocumentRequestPartyCollege {
  id: string;
  name: string;
  logoUrl: string | null;
}

// ── Direction A: college requests a document FROM a student ──────────────

export type DocumentCategory =
  | "academic"
  | "identification"
  | "financial"
  | "medical"
  | "administrative"
  | "other";

export interface SubmissionRequestItem {
  id: string;
  collegeId: string;
  studentId: string;
  documentCategory: DocumentCategory;
  documentName: string;
  instructions: string | null;
  deadline: string;
  status: DocumentSubmissionStatus;
  fileUrl: string | null;
  fileName: string | null;
  fileSizeBytes: number | null;
  submittedAt: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  student: DocumentRequestPartyStudent | null;
  college: DocumentRequestPartyCollege | null;
}

export interface SubmissionRequestListResponse {
  requests: SubmissionRequestItem[];
  meta: PaginationMeta;
}

export interface CreateSubmissionRequestInput {
  student_id: string;
  document_category: DocumentCategory;
  document_name: string;
  instructions?: string;
  deadline: string;
}

export interface SubmitDocumentInput {
  file_url: string;
  file_name?: string;
  file_size_bytes?: number;
}

export interface ReviewSubmissionInput {
  status: "verified" | "rejected";
  rejection_reason?: string;
}

// ── Direction B: student requests an official document FROM the college ──
// Raw status flow is submitted→processing→awaiting_approval→approved|rejected→issued→collected
// (see DocumentRequestStatus in ./enums); only submitted/rejected/issued are
// currently settable by the API. `displayStatus` folds in resubmission count
// and delivery mode so the student sees a friendlier label (resubmitted,
// under_review, ready_for_download, ready_to_collect) without a new raw status.

export type DocumentDeliveryMode = "digital" | "pickup" | "courier";

export type DocumentRequestDisplayStatus =
  | "submitted"
  | "resubmitted"
  | "under_review"
  | "awaiting_approval"
  | "approved"
  | "rejected"
  | "ready_for_download"
  | "ready_to_collect"
  | "collected";

export interface DocumentRequestResubmissionHistoryEntry {
  rejectionReason: string | null;
  rejectedAt: string;
  resubmittedAt: string;
  previousValues: {
    documentName: string;
    description: string | null;
    deliveryMode: DocumentDeliveryMode;
  };
}

export interface DocumentRequestItem {
  id: string;
  requestNumber: string;
  collegeId: string;
  studentId: string;
  documentName: string;
  description: string | null;
  deliveryMode: DocumentDeliveryMode;
  status: DocumentRequestStatus;
  displayStatus: DocumentRequestDisplayStatus;
  rejectionReason: string | null;
  resubmissionCount: number;
  resubmissionHistory: DocumentRequestResubmissionHistoryEntry[];
  issuedDocumentUrl: string | null;
  issuedAt: string | null;
  createdAt: string;
  student: DocumentRequestPartyStudent | null;
  college: DocumentRequestPartyCollege | null;
}

export interface DocumentRequestListResponse {
  requests: DocumentRequestItem[];
  meta: PaginationMeta;
}

export interface CreateDocumentRequestInput {
  college_id: string;
  document_name: string;
  description?: string;
  delivery_mode: DocumentDeliveryMode;
}

export interface IssueDocumentRequestInput {
  document_url: string;
  file_name?: string;
  file_size_bytes?: number;
}

export interface RejectDocumentRequestInput {
  rejection_reason: string;
}

export interface ResubmitDocumentRequestInput {
  document_name?: string;
  description?: string;
  delivery_mode?: DocumentDeliveryMode;
}
