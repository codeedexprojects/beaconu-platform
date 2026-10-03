import { api, type Paginated } from "@/lib/api";
import type {
  BlinkWithdrawalRequest,
  UpdateBlinkWithdrawalStatusResult,
  UpdateWithdrawalStatusInput,
} from "@beaconu/types";

export interface BlinkWithdrawalFilters {
  status?: "pending" | "approved" | "rejected";
  page?: number;
  limit?: number;
}

function buildQuery(filters: BlinkWithdrawalFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getBlinkWithdrawalRequests(
  filters: BlinkWithdrawalFilters = {},
): Promise<Paginated<BlinkWithdrawalRequest>> {
  return api.getPaginated<BlinkWithdrawalRequest>(
    `/api/v1/admin/blink/withdrawals${buildQuery(filters)}`,
  );
}

export async function updateBlinkWithdrawalStatus(
  id: string,
  data: UpdateWithdrawalStatusInput,
): Promise<UpdateBlinkWithdrawalStatusResult> {
  return api.patch<UpdateBlinkWithdrawalStatusResult>(
    `/api/v1/admin/blink/withdrawals/${id}/status`,
    data,
  );
}
