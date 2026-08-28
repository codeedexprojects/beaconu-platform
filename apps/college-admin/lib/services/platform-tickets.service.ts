import { api } from "@/lib/api";
import type {
  CreatePlatformTicketInput,
  PlatformTicketDetail,
  PlatformTicketListResponse,
  PlatformTicketStatus,
  PlatformTicketType,
  SendPlatformTicketMessageInput,
} from "@beaconu/types";

export interface PlatformTicketListFilters {
  status?: PlatformTicketStatus;
  type?: PlatformTicketType;
  search?: string;
  page?: number;
  limit?: number;
}

const BASE = "/api/v1/college-admin/support/platform-tickets";

export async function getPlatformTickets(
  filters: PlatformTicketListFilters = {},
): Promise<PlatformTicketListResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return api.get<PlatformTicketListResponse>(`${BASE}${qs ? `?${qs}` : ""}`);
}

export async function getPlatformTicket(
  id: string,
  messagePage?: number,
): Promise<PlatformTicketDetail> {
  const qs = messagePage ? `?page=${messagePage}` : "";
  return api.get<PlatformTicketDetail>(`${BASE}/${id}${qs}`);
}

export async function createPlatformTicket(
  input: CreatePlatformTicketInput,
): Promise<PlatformTicketDetail> {
  return api.post<PlatformTicketDetail>(BASE, input);
}

export async function replyToPlatformTicket(
  id: string,
  input: SendPlatformTicketMessageInput,
): Promise<PlatformTicketDetail> {
  return api.post<PlatformTicketDetail>(`${BASE}/${id}/messages`, input);
}
