import { api } from "@/lib/api";
import type {
  CollegeStudentListResponse,
  EnrolledStudentListResponse,
  StudentDetailDto,
} from "@beaconu/types";

export interface CollegeStudentListFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

function toQueryString(filters: CollegeStudentListFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function getCollegeStudents(
  filters: CollegeStudentListFilters = {},
): Promise<CollegeStudentListResponse> {
  return api.get<CollegeStudentListResponse>(
    `/api/v1/college-admin/students${toQueryString(filters)}`,
  );
}

export async function getEnrolledStudents(
  filters: CollegeStudentListFilters = {},
): Promise<EnrolledStudentListResponse> {
  return api.get<EnrolledStudentListResponse>(
    `/api/v1/college-admin/students/enrolled${toQueryString(filters)}`,
  );
}

export async function getStudentDetail(id: string): Promise<StudentDetailDto> {
  return api.get<StudentDetailDto>(
    `/api/v1/college-admin/students/enrolled/${id}`,
  );
}
