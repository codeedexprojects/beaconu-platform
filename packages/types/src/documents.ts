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

export interface StatusHistoryEntry {
  status: string;
  changedAt: string;
  changedBy: string | null;
}

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
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  student: DocumentRequestPartyStudent | null;
  college: DocumentRequestPartyCollege | null;
}

export interface SubmissionRequestListResponse {
  requests: SubmissionRequestItem[];
  meta: PaginationMeta;
}

export interface CreateSubmissionRequestInput {
  target: "all" | "specific";
  student_id?: string;
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

export interface SupportingDocument {
  url: string;
  name: string | null;
  sizeBytes: number | null;
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
  supportingDocuments: SupportingDocument[];
  statusHistory: StatusHistoryEntry[];
  pickupInstructions: string | null;
  officeContactPhone: string | null;
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

export interface SupportingDocumentInput {
  url: string;
  name?: string;
  size_bytes?: number;
}

export interface CreateDocumentRequestInput {
  college_id: string;
  document_template_id?: string;
  document_name?: string;
  description?: string;
  delivery_mode: DocumentDeliveryMode;
  supporting_documents?: SupportingDocumentInput[];
}

export interface IssueDocumentRequestInput {
  document_url: string;
  file_name?: string;
  file_size_bytes?: number;
  pickup_instructions?: string;
  office_contact_phone?: string;
}

export interface RejectDocumentRequestInput {
  rejection_reason: string;
}

export interface ResubmitDocumentRequestInput {
  document_name?: string;
  description?: string;
  delivery_mode?: DocumentDeliveryMode;
}

export interface DocumentTemplateItem {
  id: string;
  collegeId: string;
  name: string;
  slug: string;
  category: DocumentCategory;
  instructions: string | null;
  description: string | null;
  isStandard: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface CreateDocumentTemplateInput {
  name: string;
  category: DocumentCategory;
  instructions?: string;
  description?: string;
  sort_order?: number;
}

export interface UpdateDocumentTemplateInput {
  name?: string;
  category?: DocumentCategory;
  instructions?: string;
  description?: string;
  sort_order?: number;
}
