import { api } from "@/lib/api";
import type {
  Counsellor,
  CounsellorDetail,
  ListCounsellorsFilters,
} from "@beaconu/types";

function buildQuery(filters: ListCounsellorsFilters): string {
  const params = new URLSearchParams();
  if (filters.counsellor_type)
    params.set("counsellor_type", filters.counsellor_type);
  if (filters.status) params.set("status", filters.status);
  if (filters.language) params.set("language", filters.language);
  const query = params.toString();
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
