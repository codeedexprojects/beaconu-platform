import { api } from "@/lib/api";
import type {
  CourseSwitchRequestListResponse,
  CourseSwitchRequestItem,
  CourseSwitchRequestStatus,
  ReviewCourseSwitchInput,
} from "@beaconu/types";

const BASE = "/api/v1/college-admin/course-switch-requests";

export interface CourseSwitchRequestListFilters {
  status?: CourseSwitchRequestStatus;
  page?: number;
  limit?: number;
}

export async function getCourseSwitchRequests(
  filters: CourseSwitchRequestListFilters = {},
): Promise<CourseSwitchRequestListResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return api.get<CourseSwitchRequestListResponse>(
    `${BASE}${qs ? `?${qs}` : ""}`,
  );
}

export async function reviewCourseSwitchRequest(
  id: string,
  data: ReviewCourseSwitchInput,
): Promise<CourseSwitchRequestItem> {
  return api.patch<CourseSwitchRequestItem>(`${BASE}/${id}/review`, data);
}
