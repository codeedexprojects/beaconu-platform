import { api } from "@/lib/api";
import type {
  CampusVisit,
  CampusVisitListItem,
  AmbassadorOption,
  CreateCampusVisitInput,
  RescheduleCampusVisitInput,
  CancelCampusVisitInput,
} from "@beaconu/types";
import type { PaginationMeta } from "@beaconu/types";

const BASE = "/api/v1/student/campus-visits";

export interface VisitListFilters {
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export const campusVisitsService = {
  book: (data: CreateCampusVisitInput) => api.post<{ id: string }>(BASE, data),

  list: (filters: VisitListFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.date) params.set("date", filters.date);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return api.get<{ visits: CampusVisitListItem[]; meta: PaginationMeta }>(
      `${BASE}${qs ? `?${qs}` : ""}`,
    );
  },

  getOne: (visitId: string) => api.get<CampusVisit>(`${BASE}/${visitId}`),

  reschedule: (visitId: string, data: RescheduleCampusVisitInput) =>
    api.patch<null>(`${BASE}/${visitId}/reschedule`, data),

  cancel: (visitId: string, data: CancelCampusVisitInput) =>
    api.patch<null>(`${BASE}/${visitId}/cancel`, data),

  listAmbassadors: (collegeId: string) =>
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/v1/public/colleges/${collegeId}/ambassadors`,
    )
      .then((r) => r.json())
      .then((b) => b.data as AmbassadorOption[]),
};
