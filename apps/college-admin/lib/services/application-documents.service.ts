import { api } from "@/lib/api";
import type {
  ApplicationDetailDocumentItem,
  DocumentVerificationDetail,
  DocumentVerificationListResponse,
} from "@beaconu/types";

const BASE = "/api/v1/college-admin/applications/documents";

export async function getDocumentsUnderReview(
  page: number,
  limit = 20,
  search?: string,
): Promise<DocumentVerificationListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);
  return api.get(`${BASE}/under-review?${params.toString()}`);
}

export async function getPartiallyVerifiedDocuments(
  page: number,
  limit = 20,
  search?: string,
): Promise<DocumentVerificationListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);
  return api.get(`${BASE}/partially-verified?${params.toString()}`);
}

export async function getDocumentVerificationDetail(
  applicationId: string,
): Promise<DocumentVerificationDetail> {
  return api.get(`${BASE}/${applicationId}/verification-detail`);
}

export async function verifyApplicationDocument(
  documentId: string,
): Promise<ApplicationDetailDocumentItem> {
  return api.patch(`${BASE}/${documentId}/verify`);
}

export async function rejectApplicationDocument(
  documentId: string,
  reason: string,
): Promise<ApplicationDetailDocumentItem> {
  return api.patch(`${BASE}/${documentId}/reject`, { reason });
}
