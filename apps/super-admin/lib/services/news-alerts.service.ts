import { api, type Paginated } from "../api";
import type {
  NewsAlert,
  NewsAlertListItem,
  CreateNewsAlertInput,
  UpdateNewsAlertInput,
} from "@beaconu/types";

export const newsAlertsService = {
  list: (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Paginated<NewsAlertListItem>> => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    query.set("limit", String(params?.limit ?? 10));
    return api.getPaginated<NewsAlertListItem>(
      `/api/v1/admin/news?${query.toString()}`,
    );
  },

  getById: (id: string) => api.get<NewsAlert>(`/api/v1/admin/news/${id}`),

  create: (data: CreateNewsAlertInput) =>
    api.post<NewsAlert>("/api/v1/admin/news", data),

  update: (id: string, data: UpdateNewsAlertInput) =>
    api.patch<NewsAlert>(`/api/v1/admin/news/${id}`, data),

  publish: (id: string) =>
    api.patch<NewsAlert>(`/api/v1/admin/news/${id}/publish`, {}),

  archive: (id: string) =>
    api.patch<NewsAlert>(`/api/v1/admin/news/${id}/archive`, {}),

  unarchive: (id: string) =>
    api.patch<NewsAlert>(`/api/v1/admin/news/${id}/unarchive`, {}),
};
