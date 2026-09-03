import { api, type Paginated } from "../api";
import type { Feed, CreateFeedInput, UpdateFeedInput } from "@beaconu/types";

export const feedService = {
  list: (params?: {
    page?: number;
    limit?: number;
    is_active?: boolean;
  }): Promise<Paginated<Feed>> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.is_active !== undefined)
      query.set("is_active", String(params.is_active));
    query.set("limit", String(params?.limit ?? 20));
    return api.getPaginated<Feed>(`/api/v1/admin/feed?${query.toString()}`);
  },

  getById: (id: string) => api.get<Feed>(`/api/v1/admin/feed/${id}`),

  create: (data: CreateFeedInput) => api.post<Feed>("/api/v1/admin/feed", data),

  update: (id: string, data: UpdateFeedInput) =>
    api.patch<Feed>(`/api/v1/admin/feed/${id}`, data),

  deactivate: (id: string) =>
    api.patch<Feed>(`/api/v1/admin/feed/${id}/deactivate`, {}),

  activate: (id: string) =>
    api.patch<Feed>(`/api/v1/admin/feed/${id}/activate`, {}),
};
