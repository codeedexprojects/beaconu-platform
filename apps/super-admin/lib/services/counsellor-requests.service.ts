import { api } from "@/lib/api";
import type {
  CounsellorRegistrationRequest,
  UpdateCounsellorRequestStatusInput,
} from "@beaconu/types";

export interface CounsellorRequestFilters {
  status?: "pending" | "approved" | "rejected";
  counsellor_type?: "academic" | "mindcare";
  search?: string;
  page?: number;
  limit?: number;
}

export interface CounsellorRequestsListResponse {
  data: CounsellorRegistrationRequest[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

function buildQuery(filters: CounsellorRequestFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.counsellor_type)
    params.set("counsellor_type", filters.counsellor_type);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getCounsellorRequests(
  filters: CounsellorRequestFilters = {},
): Promise<CounsellorRequestsListResponse> {
  return api.get<CounsellorRequestsListResponse>(
    `/api/v1/admin/counsellor-requests${buildQuery(filters)}`,
  );
}

export async function getCounsellorRequestById(
  id: string,
): Promise<CounsellorRegistrationRequest> {
  return api.get<CounsellorRegistrationRequest>(
    `/api/v1/admin/counsellor-requests/${id}`,
  );
}

export async function updateCounsellorRequestStatus(
  id: string,
  data: UpdateCounsellorRequestStatusInput,
): Promise<CounsellorRegistrationRequest> {
  return api.patch<CounsellorRegistrationRequest>(
    `/api/v1/admin/counsellor-requests/${id}/status`,
    data,
  );
}
