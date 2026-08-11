import { api } from "@/lib/api";
import type {
  SubmissionRequestItem,
  CreateSubmissionRequestInput,
  ReviewSubmissionInput,
  DocumentRequestItem,
  IssueDocumentRequestInput,
  RejectDocumentRequestInput,
  DocumentTemplateItem,
  CreateDocumentTemplateInput,
  UpdateDocumentTemplateInput,
  PaginationMeta,
} from "@beaconu/types";

const BASE = "/api/v1/college-admin/documents";

export interface DocumentListFilters {
  status?: string;
  student_id?: string;
  page?: number;
  limit?: number;
}

function toQueryString(filters: DocumentListFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.student_id) params.set("student_id", filters.student_id);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ── Direction A: documents requested FROM students ─────────────────────────

export async function createSubmissionRequest(
  data: CreateSubmissionRequestInput,
): Promise<SubmissionRequestItem | SubmissionRequestItem[]> {
  return api.post(`${BASE}/submission-requests`, data);
}

export async function getSubmissionRequests(
  filters: DocumentListFilters = {},
): Promise<{ requests: SubmissionRequestItem[]; meta: PaginationMeta }> {
  return api.get(`${BASE}/submission-requests${toQueryString(filters)}`);
}

export async function reviewSubmission(
  requestId: string,
  data: ReviewSubmissionInput,
): Promise<SubmissionRequestItem> {
  return api.patch(`${BASE}/submission-requests/${requestId}/review`, data);
}

// ── Direction B: documents requested BY students ────────────────────────────

export async function getDocumentRequests(
  filters: DocumentListFilters = {},
): Promise<{ requests: DocumentRequestItem[]; meta: PaginationMeta }> {
  return api.get(`${BASE}/requests${toQueryString(filters)}`);
}

export async function startReviewDocumentRequest(
  requestId: string,
): Promise<DocumentRequestItem> {
  return api.patch(`${BASE}/requests/${requestId}/start-review`, {});
}

export async function sendForApprovalDocumentRequest(
  requestId: string,
): Promise<DocumentRequestItem> {
  return api.patch(`${BASE}/requests/${requestId}/send-for-approval`, {});
}

export async function approveDocumentRequest(
  requestId: string,
): Promise<DocumentRequestItem> {
  return api.patch(`${BASE}/requests/${requestId}/approve`, {});
}

export async function issueDocumentRequest(
  requestId: string,
  data: IssueDocumentRequestInput,
): Promise<DocumentRequestItem> {
  return api.patch(`${BASE}/requests/${requestId}/issue`, data);
}

export async function rejectDocumentRequest(
  requestId: string,
  data: RejectDocumentRequestInput,
): Promise<DocumentRequestItem> {
  return api.patch(`${BASE}/requests/${requestId}/reject`, data);
}

// ── Document templates: catalog of documents students can request ─────────

export async function getDocumentTemplates(
  includeInactive = false,
): Promise<DocumentTemplateItem[]> {
  return api.get(
    `${BASE}/templates${includeInactive ? "?include_inactive=true" : ""}`,
  );
}

export async function createDocumentTemplate(
  data: CreateDocumentTemplateInput,
): Promise<DocumentTemplateItem> {
  return api.post(`${BASE}/templates`, data);
}

export async function updateDocumentTemplate(
  templateId: string,
  data: UpdateDocumentTemplateInput,
): Promise<DocumentTemplateItem> {
  return api.patch(`${BASE}/templates/${templateId}`, data);
}

export async function activateDocumentTemplate(
  templateId: string,
): Promise<DocumentTemplateItem> {
  return api.patch(`${BASE}/templates/${templateId}/activate`, {});
}

export async function deactivateDocumentTemplate(
  templateId: string,
): Promise<DocumentTemplateItem> {
  return api.patch(`${BASE}/templates/${templateId}/deactivate`, {});
}
