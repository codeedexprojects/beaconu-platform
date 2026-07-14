import { api } from "@/lib/api";
import type {
  AdmissionCycleItem,
  AdmissionCycleCourseItem,
  AttachAdmissionCycleCourseInput,
  CreateAdmissionCycleInput,
  CreateSeatPoolInput,
  SeatPoolItem,
  UpdateAdmissionCycleCourseInput,
  UpdateAdmissionCycleInput,
  UpdateSeatPoolInput,
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

export async function getAdmissionCycleCourses(
  admissionCycleId: string,
): Promise<AdmissionCycleCourseItem[]> {
  return api.get(`${BASE}/${admissionCycleId}/courses`);
}

export async function attachAdmissionCycleCourse(
  admissionCycleId: string,
  data: AttachAdmissionCycleCourseInput,
): Promise<AdmissionCycleCourseItem> {
  return api.post(`${BASE}/${admissionCycleId}/courses`, data);
}

export async function updateAdmissionCycleCourse(
  admissionCycleId: string,
  id: string,
  data: UpdateAdmissionCycleCourseInput,
): Promise<AdmissionCycleCourseItem> {
  return api.patch(`${BASE}/${admissionCycleId}/courses/${id}`, data);
}

export async function detachAdmissionCycleCourse(
  admissionCycleId: string,
  id: string,
): Promise<AdmissionCycleCourseItem> {
  return api.delete(`${BASE}/${admissionCycleId}/courses/${id}`);
}

export async function getSeatPools(
  admissionCycleId: string,
): Promise<SeatPoolItem[]> {
  return api.get(`${BASE}/${admissionCycleId}/seat-pools`);
}

export async function createSeatPool(
  admissionCycleId: string,
  data: CreateSeatPoolInput,
): Promise<SeatPoolItem> {
  return api.post(`${BASE}/${admissionCycleId}/seat-pools`, data);
}

export async function updateSeatPool(
  admissionCycleId: string,
  id: string,
  data: UpdateSeatPoolInput,
): Promise<SeatPoolItem> {
  return api.patch(`${BASE}/${admissionCycleId}/seat-pools/${id}`, data);
}

export async function deleteSeatPool(
  admissionCycleId: string,
  id: string,
): Promise<SeatPoolItem> {
  return api.delete(`${BASE}/${admissionCycleId}/seat-pools/${id}`);
}
