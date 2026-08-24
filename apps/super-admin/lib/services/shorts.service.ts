import { api, type Paginated } from "../api";
import type { Short, CreateShortInput, UpdateShortInput } from "@beaconu/types";

export const shortsService = {
  list: (params?: {
    page?: number;
    limit?: number;
    is_active?: boolean;
  }): Promise<Paginated<Short>> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.is_active !== undefined)
      query.set("is_active", String(params.is_active));
    query.set("limit", String(params?.limit ?? 20));
    return api.getPaginated<Short>(`/api/v1/admin/shorts?${query.toString()}`);
  },

  getById: (id: string) => api.get<Short>(`/api/v1/admin/shorts/${id}`),

  create: (data: CreateShortInput) =>
    api.post<Short>("/api/v1/admin/shorts", data),

  update: (id: string, data: UpdateShortInput) =>
    api.patch<Short>(`/api/v1/admin/shorts/${id}`, data),

  deactivate: (id: string) =>
    api.patch<Short>(`/api/v1/admin/shorts/${id}/deactivate`, {}),

  activate: (id: string) =>
    api.patch<Short>(`/api/v1/admin/shorts/${id}/activate`, {}),
};
