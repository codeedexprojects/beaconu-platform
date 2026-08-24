import { api } from "../api";
import type {
  PlatformTicketAdminListResponse,
  PlatformTicketDetail,
  PlatformTicketStatus,
  PlatformTicketType,
  SendPlatformTicketMessageInput,
  UpdatePlatformTicketStatusInput,
} from "@beaconu/types";

export interface CollegeTicketListFilters {
  status?: PlatformTicketStatus;
  type?: PlatformTicketType;
  college_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const BASE = "/api/v1/admin/college-tickets";

export const collegeTicketsService = {
  list: (
    filters: CollegeTicketListFilters = {},
  ): Promise<PlatformTicketAdminListResponse> => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.type) params.set("type", filters.type);
    if (filters.college_id) params.set("college_id", filters.college_id);
    if (filters.search) params.set("search", filters.search);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return api.get<PlatformTicketAdminListResponse>(
      `${BASE}${qs ? `?${qs}` : ""}`,
    );
  },

  getById: (id: string, messagePage?: number) => {
    const qs = messagePage ? `?page=${messagePage}` : "";
    return api.get<PlatformTicketDetail>(`${BASE}/${id}${qs}`);
  },

  reply: (id: string, data: SendPlatformTicketMessageInput) =>
    api.post<PlatformTicketDetail>(`${BASE}/${id}/messages`, data),

  updateStatus: (id: string, data: UpdatePlatformTicketStatusInput) =>
    api.patch<PlatformTicketDetail>(`${BASE}/${id}/status`, data),
};
