import { api } from "@/lib/api";
import type {
  ReviewSeatCancellationInput,
  SeatCancellationListResponse,
  SeatCancellationRequest,
  SeatCancellationStatus,
} from "@beaconu/types";

const BASE = "/api/v1/college-admin/seat-cancellations";

export interface SeatCancellationListFilters {
  status?: SeatCancellationStatus;
  page?: number;
  limit?: number;
}

export async function getSeatCancellations(
  filters: SeatCancellationListFilters = {},
): Promise<SeatCancellationListResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return api.get<SeatCancellationListResponse>(`${BASE}${qs ? `?${qs}` : ""}`);
}

export async function reviewSeatCancellation(
  id: string,
  data: ReviewSeatCancellationInput,
): Promise<SeatCancellationRequest> {
  return api.patch<SeatCancellationRequest>(`${BASE}/${id}/review`, data);
}
