import { api } from "@/lib/api";
import type {
  FinalizeSeatCancellationClearanceInput,
  ReviewSeatCancellationInput,
  ScheduleSeatCancellationCounselingInput,
  SeatCancellationCaseDetail,
  SeatCancellationListResponse,
  SeatCancellationRequest,
  SeatCancellationStatus,
  SubmitSeatCancellationCounselingOutcomeInput,
  SubmitSeatCancellationInitiationInput,
  SubmitSeatCancellationSettlementInput,
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

export async function getSeatCancellationCase(
  id: string,
): Promise<SeatCancellationCaseDetail> {
  return api.get<SeatCancellationCaseDetail>(`${BASE}/${id}`);
}

export async function submitSeatCancellationInitiation(
  id: string,
  data: SubmitSeatCancellationInitiationInput,
): Promise<SeatCancellationCaseDetail> {
  return api.patch<SeatCancellationCaseDetail>(
    `${BASE}/${id}/initiation`,
    data,
  );
}

export async function scheduleSeatCancellationCounseling(
  id: string,
  data: ScheduleSeatCancellationCounselingInput,
): Promise<SeatCancellationCaseDetail> {
  return api.post<SeatCancellationCaseDetail>(
    `${BASE}/${id}/schedule-counseling`,
    data,
  );
}

export async function submitSeatCancellationCounselingOutcome(
  id: string,
  data: SubmitSeatCancellationCounselingOutcomeInput,
): Promise<SeatCancellationCaseDetail> {
  return api.patch<SeatCancellationCaseDetail>(
    `${BASE}/${id}/counseling-outcome`,
    data,
  );
}

export async function submitSeatCancellationSettlement(
  id: string,
  data: SubmitSeatCancellationSettlementInput,
): Promise<SeatCancellationCaseDetail> {
  return api.patch<SeatCancellationCaseDetail>(
    `${BASE}/${id}/settlement`,
    data,
  );
}

export async function finalizeSeatCancellationClearance(
  id: string,
  data: FinalizeSeatCancellationClearanceInput,
): Promise<SeatCancellationCaseDetail> {
  return api.patch<SeatCancellationCaseDetail>(
    `${BASE}/${id}/final-clearance`,
    data,
  );
}
