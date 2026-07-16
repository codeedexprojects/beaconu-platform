import { api } from "@/lib/api";
import type {
  AdmissionCycleItem,
  AdmissionCycleCourseItem,
  AttachAdmissionCycleCourseInput,
  AttachCourseQuotaInput,
  CourseQuotaSeatsItem,
  CreateAdmissionCycleInput,
  CreateDocumentRequirementInput,
  CreateSeatPoolInput,
  DocumentRequirementItem,
  SeatPoolItem,
  UpdateAdmissionCycleCourseInput,
  UpdateAdmissionCycleInput,
  UpdateCourseQuotaSeatsInput,
  UpdateDocumentRequirementInput,
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

export async function getCourseQuotaSeats(
  admissionCycleId: string,
  courseId: string,
): Promise<CourseQuotaSeatsItem[]> {
  return api.get(`${BASE}/${admissionCycleId}/courses/${courseId}/quotas`);
}

export async function attachCourseQuota(
  admissionCycleId: string,
  courseId: string,
  data: AttachCourseQuotaInput,
): Promise<CourseQuotaSeatsItem> {
  return api.post(
    `${BASE}/${admissionCycleId}/courses/${courseId}/quotas`,
    data,
  );
}

export async function updateCourseQuotaSeats(
  admissionCycleId: string,
  courseId: string,
  id: string,
  data: UpdateCourseQuotaSeatsInput,
): Promise<CourseQuotaSeatsItem> {
  return api.patch(
    `${BASE}/${admissionCycleId}/courses/${courseId}/quotas/${id}`,
    data,
  );
}

export async function detachCourseQuota(
  admissionCycleId: string,
  courseId: string,
  id: string,
): Promise<CourseQuotaSeatsItem> {
  return api.delete(
    `${BASE}/${admissionCycleId}/courses/${courseId}/quotas/${id}`,
  );
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

export async function getDocumentRequirements(
  admissionCycleId: string,
): Promise<DocumentRequirementItem[]> {
  return api.get(`${BASE}/${admissionCycleId}/documents`);
}

export async function createDocumentRequirement(
  admissionCycleId: string,
  data: CreateDocumentRequirementInput,
): Promise<DocumentRequirementItem> {
  return api.post(`${BASE}/${admissionCycleId}/documents`, data);
}

export async function updateDocumentRequirement(
  admissionCycleId: string,
  id: string,
  data: UpdateDocumentRequirementInput,
): Promise<DocumentRequirementItem> {
  return api.patch(`${BASE}/${admissionCycleId}/documents/${id}`, data);
}

export async function deleteDocumentRequirement(
  admissionCycleId: string,
  id: string,
): Promise<DocumentRequirementItem> {
  return api.delete(`${BASE}/${admissionCycleId}/documents/${id}`);
}
