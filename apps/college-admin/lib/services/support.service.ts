import { api } from "@/lib/api";
import type {
  SendTicketMessageInput,
  TicketAdminListResponse,
  TicketDetail,
  TicketStatus,
  UpdateTicketStatusInput,
} from "@beaconu/types";

export interface TicketListFilters {
  status?: TicketStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getCollegeTickets(
  filters: TicketListFilters = {},
): Promise<TicketAdminListResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return api.get<TicketAdminListResponse>(
    `/api/v1/college-admin/support${qs ? `?${qs}` : ""}`,
  );
}

export async function getCollegeTicket(id: string): Promise<TicketDetail> {
  return api.get<TicketDetail>(`/api/v1/college-admin/support/${id}`);
}

export async function replyToTicket(
  id: string,
  input: SendTicketMessageInput,
): Promise<TicketDetail> {
  return api.post<TicketDetail>(
    `/api/v1/college-admin/support/${id}/messages`,
    input,
  );
}

export async function updateTicketStatus(
  id: string,
  input: UpdateTicketStatusInput,
): Promise<TicketDetail> {
  return api.patch<TicketDetail>(
    `/api/v1/college-admin/support/${id}/status`,
    input,
  );
}
