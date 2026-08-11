import { api } from "@/lib/api";
import type {
  CreateNoticeInput,
  NoticeDetail,
  NoticeListResponse,
  NoticeStatus,
  UpdateNoticeInput,
} from "@beaconu/types";

export interface NoticeListFilters {
  status?: NoticeStatus;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getNotices(
  filters: NoticeListFilters = {},
): Promise<NoticeListResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return api.get<NoticeListResponse>(
    `/api/v1/college-admin/notices${qs ? `?${qs}` : ""}`,
  );
}

export async function getNotice(id: string): Promise<NoticeDetail> {
  return api.get<NoticeDetail>(`/api/v1/college-admin/notices/${id}`);
}

export async function createNotice(
  data: CreateNoticeInput,
): Promise<NoticeDetail> {
  return api.post<NoticeDetail>("/api/v1/college-admin/notices", data);
}

export async function updateNotice(
  id: string,
  data: UpdateNoticeInput,
): Promise<NoticeDetail> {
  return api.patch<NoticeDetail>(`/api/v1/college-admin/notices/${id}`, data);
}

export async function archiveNotice(id: string): Promise<NoticeDetail> {
  return api.patch<NoticeDetail>(
    `/api/v1/college-admin/notices/${id}/archive`,
    undefined,
  );
}

export async function restoreNotice(id: string): Promise<NoticeDetail> {
  return api.patch<NoticeDetail>(
    `/api/v1/college-admin/notices/${id}/restore`,
    undefined,
  );
}
