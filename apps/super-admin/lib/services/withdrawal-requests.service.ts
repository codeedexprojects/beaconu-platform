import { api, type Paginated } from "@/lib/api";
import type {
  CounsellorWithdrawalRequest,
  UpdateWithdrawalStatusInput,
} from "@beaconu/types";

export interface UpdateWithdrawalStatusResult {
  id: string;
  withdrawal_status: string;
  review_remarks: string | null;
  updated_at: string;
}

export interface WithdrawalRequestFilters {
  status?: "pending" | "approved" | "rejected";
  page?: number;
  limit?: number;
}

function buildQuery(filters: WithdrawalRequestFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getWithdrawalRequests(
  filters: WithdrawalRequestFilters = {},
): Promise<Paginated<CounsellorWithdrawalRequest>> {
  return api.getPaginated<CounsellorWithdrawalRequest>(
    `/api/v1/admin/counsellors/withdrawals${buildQuery(filters)}`,
  );
}

export async function updateWithdrawalStatus(
  id: string,
  data: UpdateWithdrawalStatusInput,
): Promise<UpdateWithdrawalStatusResult> {
  return api.patch<UpdateWithdrawalStatusResult>(
    `/api/v1/admin/counsellors/withdrawals/${id}/status`,
    data,
  );
}
