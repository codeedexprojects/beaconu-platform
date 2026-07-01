import { api } from "@/lib/api";
import type { CampusVisitListItem, PaginationMeta } from "@beaconu/types";

export interface AdminVisitFilters {
  status?: string;
  date?: string;
  ambassador_id?: string;
  page?: number;
  limit?: number;
}

export async function getCollegeCampusVisits(
  filters: AdminVisitFilters = {},
): Promise<{ visits: CampusVisitListItem[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.date) params.set("date", filters.date);
  if (filters.ambassador_id) params.set("ambassador_id", filters.ambassador_id);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return api.get(`/api/v1/college-admin/campus-visits${qs ? `?${qs}` : ""}`);
}
