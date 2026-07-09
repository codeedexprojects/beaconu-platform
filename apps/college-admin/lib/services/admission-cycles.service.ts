import { api } from "@/lib/api";
import type {
  AdmissionCycleItem,
  CreateAdmissionCycleInput,
  UpdateAdmissionCycleInput,
} from "@beaconu/types";

const BASE = "/api/v1/college-admin/application-forms";

export interface AdmissionCycleListFilters {
  application_type?: string;
  program_level?: string;
  admission_year?: string;
}

function toQueryString(filters: AdmissionCycleListFilters): string {
  const params = new URLSearchParams();
  if (filters.application_type)
    params.set("application_type", filters.application_type);
  if (filters.program_level) params.set("program_level", filters.program_level);
  if (filters.admission_year)
    params.set("admission_year", filters.admission_year);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function getAdmissionCycles(
  filters: AdmissionCycleListFilters = {},
): Promise<AdmissionCycleItem[]> {
  return api.get(`${BASE}${toQueryString(filters)}`);
}

export async function createAdmissionCycle(
  data: CreateAdmissionCycleInput,
): Promise<AdmissionCycleItem> {
  return api.post(BASE, data);
}

export async function updateAdmissionCycle(
  id: string,
  data: UpdateAdmissionCycleInput,
): Promise<AdmissionCycleItem> {
  return api.patch(`${BASE}/${id}`, data);
}

export async function deleteAdmissionCycle(
  id: string,
): Promise<AdmissionCycleItem> {
  return api.delete(`${BASE}/${id}`);
}
