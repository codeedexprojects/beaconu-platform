import { api } from "@/lib/api";
import type { CollegeStudentListResponse } from "@beaconu/types";

export interface CollegeStudentListFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export async function getCollegeStudents(
  filters: CollegeStudentListFilters = {},
): Promise<CollegeStudentListResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return api.get<CollegeStudentListResponse>(
    `/api/v1/college-admin/students${qs ? `?${qs}` : ""}`,
  );
}
