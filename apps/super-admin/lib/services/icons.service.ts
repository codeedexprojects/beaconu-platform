import { api, type Paginated } from "../api";
import type {
  IconItem,
  CreateIconInput,
  UpdateIconInput,
} from "@beaconu/types";

export type { IconItem, CreateIconInput, UpdateIconInput };

export const iconsService = {
  getAll: (filters?: {
    is_active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Paginated<IconItem>> => {
    const query = new URLSearchParams();
    if (filters?.is_active !== undefined) {
      query.set("is_active", String(filters.is_active));
    }
    if (filters?.search) query.set("search", filters.search);
    query.set("page", String(filters?.page ?? 1));
    query.set("limit", String(filters?.limit ?? 20));
    return api.getPaginated<IconItem>(
      `/api/v1/admin/icons?${query.toString()}`,
    );
  },

  getById: (id: string) => api.get<IconItem>(`/api/v1/admin/icons/${id}`),

  create: (data: CreateIconInput) =>
    api.post<IconItem>("/api/v1/admin/icons", data),

  update: (id: string, data: UpdateIconInput) =>
    api.patch<IconItem>(`/api/v1/admin/icons/${id}`, data),

  deactivate: (id: string) =>
    api.patch<IconItem>(`/api/v1/admin/icons/${id}/deactivate`, {}),

  activate: (id: string) =>
    api.patch<IconItem>(`/api/v1/admin/icons/${id}/activate`, {}),
};
