import { api, type Paginated } from "../api";
import type {
  StarterGuide,
  StarterGuideListItem,
  CreateStarterGuideInput,
  UpdateStarterGuideInput,
} from "@beaconu/types";

export const starterGuideService = {
  list: (params?: {
    page?: number;
    limit?: number;
    is_active?: boolean;
  }): Promise<Paginated<StarterGuideListItem>> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.is_active !== undefined)
      query.set("is_active", String(params.is_active));
    query.set("limit", String(params?.limit ?? 20));
    return api.getPaginated<StarterGuideListItem>(
      `/api/v1/admin/starter-guide?${query.toString()}`,
    );
  },

  getById: (id: string) =>
    api.get<StarterGuide>(`/api/v1/admin/starter-guide/${id}`),

  create: (data: CreateStarterGuideInput) =>
    api.post<StarterGuide>("/api/v1/admin/starter-guide", data),

  update: (id: string, data: UpdateStarterGuideInput) =>
    api.patch<StarterGuide>(`/api/v1/admin/starter-guide/${id}`, data),

  deactivate: (id: string) =>
    api.patch<StarterGuide>(`/api/v1/admin/starter-guide/${id}/deactivate`, {}),

  activate: (id: string) =>
    api.patch<StarterGuide>(`/api/v1/admin/starter-guide/${id}/activate`, {}),
};
