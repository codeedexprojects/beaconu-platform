import { api, type Paginated } from "@/lib/api";
import type {
  RedemptionRequest,
  RedemptionPayoutDetails,
  ReviewRedemptionInput,
  ReviewRedemptionResult,
} from "@beaconu/types";

export interface RedemptionFilters {
  status?: "pending" | "approved" | "rejected";
  page?: number;
  limit?: number;
}

function buildQuery(filters: RedemptionFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getRedemptionRequests(
  filters: RedemptionFilters = {},
): Promise<Paginated<RedemptionRequest>> {
  return api.getPaginated<RedemptionRequest>(
    `/api/v1/admin/student-redemptions${buildQuery(filters)}`,
  );
}

/** The only call returning a decrypted account number. */
export async function getRedemptionPayoutDetails(
  id: string,
): Promise<RedemptionPayoutDetails> {
  return api.get<RedemptionPayoutDetails>(
    `/api/v1/admin/student-redemptions/${id}/payout-details`,
  );
}

export async function reviewRedemption(
  id: string,
  data: ReviewRedemptionInput,
): Promise<ReviewRedemptionResult> {
  return api.patch<ReviewRedemptionResult>(
    `/api/v1/admin/student-redemptions/${id}/status`,
    data,
  );
}
