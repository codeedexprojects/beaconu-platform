import { api } from "@/lib/api";
import type {
  AntiRaggingComplaintItem,
  ResolveComplaintInput,
  PaginationMeta,
} from "@beaconu/types";

const BASE = "/api/v1/college-admin/anti-ragging-complaints";

export interface AntiRaggingListFilters {
  status?: string;
  incident_type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

function toQueryString(filters: AntiRaggingListFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.incident_type) params.set("incident_type", filters.incident_type);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function getAntiRaggingComplaints(
  filters: AntiRaggingListFilters = {},
): Promise<{ complaints: AntiRaggingComplaintItem[]; meta: PaginationMeta }> {
  return api.get(`${BASE}${toQueryString(filters)}`);
}

export async function getAntiRaggingComplaint(
  complaintId: string,
): Promise<AntiRaggingComplaintItem> {
  return api.get(`${BASE}/${complaintId}`);
}

export async function acknowledgeComplaint(
  complaintId: string,
): Promise<AntiRaggingComplaintItem> {
  return api.patch(`${BASE}/${complaintId}/acknowledge`, {});
}

export async function startInvestigationComplaint(
  complaintId: string,
): Promise<AntiRaggingComplaintItem> {
  return api.patch(`${BASE}/${complaintId}/start-investigation`, {});
}

export async function resolveComplaint(
  complaintId: string,
  data: ResolveComplaintInput,
): Promise<AntiRaggingComplaintItem> {
  return api.patch(`${BASE}/${complaintId}/resolve`, data);
}
