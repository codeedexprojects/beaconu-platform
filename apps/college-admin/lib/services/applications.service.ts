import { api } from "@/lib/api";
import type {
  ApplicationDetailDto,
  ApplicationListItem,
  EnrollmentItem,
  PaginationMeta,
  PendingEnrollmentListResponse,
} from "@beaconu/types";

export interface ApplicationListFilters {
  admission_cycle_id?: string;
  form_status?: string;
  fee_payment_status?: string;
  course_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getApplications(
  filters: ApplicationListFilters = {},
): Promise<{ applications: ApplicationListItem[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (filters.admission_cycle_id)
    params.set("admission_cycle_id", filters.admission_cycle_id);
  if (filters.form_status) params.set("form_status", filters.form_status);
  if (filters.fee_payment_status)
    params.set("fee_payment_status", filters.fee_payment_status);
  if (filters.course_id) params.set("course_id", filters.course_id);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return api.get(`/api/v1/college-admin/applications${qs ? `?${qs}` : ""}`);
}

export async function getApplicationById(
  id: string,
): Promise<ApplicationDetailDto> {
  return api.get(`/api/v1/college-admin/applications/${id}`);
}

export async function enrollApplicationCourse(
  applicationCourseId: string,
): Promise<EnrollmentItem> {
  return api.post(
    `/api/v1/college-admin/applications/courses/${applicationCourseId}/enroll`,
    {},
  );
}

export interface PendingEnrollmentFilters {
  admission_cycle_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getPendingEnrollments(
  filters: PendingEnrollmentFilters = {},
): Promise<PendingEnrollmentListResponse> {
  const params = new URLSearchParams();
  if (filters.admission_cycle_id)
    params.set("admission_cycle_id", filters.admission_cycle_id);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return api.get(
    `/api/v1/college-admin/applications/pending-enrollment${qs ? `?${qs}` : ""}`,
  );
}
