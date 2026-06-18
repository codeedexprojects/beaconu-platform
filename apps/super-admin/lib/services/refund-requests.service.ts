import { api } from "@/lib/api";
import type {
  CounsellingRefundRequest,
  UpdateRefundStatusInput,
} from "@beaconu/types";

export interface UpdateRefundStatusResult {
  id: string;
  status: string;
  review_remarks: string | null;
  updated_at: string;
}

export interface RefundRequestFilters {
  status?: "pending" | "approved" | "rejected";
  page?: number;
  limit?: number;
}

export interface RefundRequestsListResponse {
  data: CounsellingRefundRequest[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

function buildQuery(filters: RefundRequestFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getRefundRequests(
  filters: RefundRequestFilters = {},
): Promise<RefundRequestsListResponse> {
  return api.get<RefundRequestsListResponse>(
    `/api/v1/admin/counsellors/refund-requests${buildQuery(filters)}`,
  );
}

export async function updateRefundStatus(
  id: string,
  data: UpdateRefundStatusInput,
): Promise<UpdateRefundStatusResult> {
  return api.patch<UpdateRefundStatusResult>(
    `/api/v1/admin/counsellors/refund-requests/${id}/status`,
    data,
  );
}
