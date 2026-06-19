import { api, type Paginated } from "@/lib/api";
import type {
  Counsellor,
  CounsellorDetail,
  CounsellorRecentSession,
  CounsellorSlot,
  CounsellorWallet,
  ListCounsellorsFilters,
} from "@beaconu/types";

export interface PageQuery {
  page?: number;
  limit?: number;
}

function buildQuery(filters: ListCounsellorsFilters): string {
  const params = new URLSearchParams();
  if (filters.counsellor_type)
    params.set("counsellor_type", filters.counsellor_type);
  if (filters.status) params.set("status", filters.status);
  if (filters.language) params.set("language", filters.language);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function buildPageQuery(
  params: Record<string, string | number | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getCounsellors(
  filters: ListCounsellorsFilters = {},
): Promise<Counsellor[]> {
  return api.get<Counsellor[]>(
    `/api/v1/admin/counsellors${buildQuery(filters)}`,
  );
}

export async function getCounsellorDetail(
  id: string,
): Promise<CounsellorDetail> {
  return api.get<CounsellorDetail>(`/api/v1/admin/counsellors/${id}/detail`);
}

export async function getCounsellorWalletTransactions(
  id: string,
  query: PageQuery = {},
): Promise<CounsellorWallet | null> {
  return api.get<CounsellorWallet | null>(
    `/api/v1/admin/counsellors/${id}/wallet-transactions${buildPageQuery({ ...query })}`,
  );
}

export async function getCounsellorSlots(
  id: string,
  status: "available" | "booked",
  query: PageQuery = {},
): Promise<Paginated<CounsellorSlot>> {
  return api.getPaginated<CounsellorSlot>(
    `/api/v1/admin/counsellors/${id}/slots${buildPageQuery({ status, ...query })}`,
  );
}

export async function getCounsellorSessions(
  id: string,
  query: PageQuery = {},
): Promise<Paginated<CounsellorRecentSession>> {
  return api.getPaginated<CounsellorRecentSession>(
    `/api/v1/admin/counsellors/${id}/sessions${buildPageQuery({ ...query })}`,
  );
}
