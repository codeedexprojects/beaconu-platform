import { api } from "@/lib/api";
import type {
  CampusVisit,
  CampusVisitListItem,
  CampusVisitAvailabilityEntry,
  UpsertCampusVisitAvailabilityInput,
  CampusVisitStats,
  CampusVisitSettingsItem,
  UpsertCampusVisitSettingsInput,
  CampusVisitCalendarDay,
  CampusVisitDateOverrideItem,
  CreateCampusVisitDateOverrideInput,
  CancelCampusVisitByAdminInput,
  BulkCancelVisitsForDateInput,
  PaginationMeta,
} from "@beaconu/types";

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

export async function getCollegeCampusVisit(id: string): Promise<CampusVisit> {
  return api.get(`/api/v1/college-admin/campus-visits/${id}`);
}

export async function getCollegeCampusVisitStats(): Promise<CampusVisitStats> {
  return api.get(`/api/v1/college-admin/campus-visits/stats`);
}

export async function getCampusVisitAvailability(): Promise<
  CampusVisitAvailabilityEntry[]
> {
  return api.get(`/api/v1/college-admin/campus-visits/availability`);
}

export async function upsertCampusVisitAvailability(
  data: UpsertCampusVisitAvailabilityInput,
): Promise<CampusVisitAvailabilityEntry> {
  return api.put(`/api/v1/college-admin/campus-visits/availability`, data);
}

export async function getCampusVisitSettings(): Promise<CampusVisitSettingsItem> {
  return api.get(`/api/v1/college-admin/campus-visits/settings`);
}

export async function upsertCampusVisitSettings(
  data: UpsertCampusVisitSettingsInput,
): Promise<CampusVisitSettingsItem> {
  return api.put(`/api/v1/college-admin/campus-visits/settings`, data);
}

export async function getCampusVisitCalendar(
  year: number,
  month: number,
): Promise<CampusVisitCalendarDay[]> {
  return api.get(
    `/api/v1/college-admin/campus-visits/calendar?year=${year}&month=${month}`,
  );
}

export async function addCampusVisitDateOverride(
  data: CreateCampusVisitDateOverrideInput,
): Promise<CampusVisitDateOverrideItem> {
  return api.post(`/api/v1/college-admin/campus-visits/date-overrides`, data);
}

export async function removeCampusVisitDateOverride(
  overrideId: string,
): Promise<void> {
  return api.delete(
    `/api/v1/college-admin/campus-visits/date-overrides/${overrideId}`,
  );
}

export async function cancelCampusVisitByAdmin(
  visitId: string,
  data: CancelCampusVisitByAdminInput,
): Promise<CampusVisit> {
  return api.patch(
    `/api/v1/college-admin/campus-visits/${visitId}/cancel`,
    data,
  );
}

export async function cancelCampusVisitsForDate(
  data: BulkCancelVisitsForDateInput,
): Promise<{ cancelledCount: number }> {
  return api.post(`/api/v1/college-admin/campus-visits/cancel-date`, data);
}
