import { api } from "@/lib/api";
import type {
  CallRequestAdminListResponse,
  CallRequestDetail,
  CallRequestStatus,
  UpdateCallRequestStatusInput,
} from "@beaconu/types";

export interface CallRequestListFilters {
  status?: CallRequestStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getCallRequests(
  filters: CallRequestListFilters = {},
): Promise<CallRequestAdminListResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return api.get<CallRequestAdminListResponse>(
    `/api/v1/college-admin/call-requests${qs ? `?${qs}` : ""}`,
  );
}

export async function getCallRequest(id: string): Promise<CallRequestDetail> {
  return api.get<CallRequestDetail>(
    `/api/v1/college-admin/call-requests/${id}`,
  );
}

export async function updateCallRequestStatus(
  id: string,
  input: UpdateCallRequestStatusInput,
): Promise<CallRequestDetail> {
  return api.patch<CallRequestDetail>(
    `/api/v1/college-admin/call-requests/${id}/status`,
    input,
  );
}
