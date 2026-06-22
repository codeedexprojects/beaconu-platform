import { api, type Paginated } from "@/lib/api";
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
): Promise<Paginated<CounsellingRefundRequest>> {
  return api.getPaginated<CounsellingRefundRequest>(
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
