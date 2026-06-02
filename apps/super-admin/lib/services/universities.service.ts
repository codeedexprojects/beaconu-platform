import { api } from "../api";
import type { University } from "@beaconu/types";
import type {
  CreateUniversityInput,
  UpdateUniversityInput,
} from "@beaconu/validation";

export type { University, CreateUniversityInput, UpdateUniversityInput };

export const universitiesService = {
  getAll: (filters?: {
    status?: string;
    university_type_id?: string;
    state?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.university_type_id)
      params.set("university_type_id", filters.university_type_id);
    if (filters?.state) params.set("state", filters.state);
    if (filters?.search) params.set("search", filters.search);
    const query = params.toString();
    return api.get<University[]>(
      `/api/v1/admin/universities${query ? `?${query}` : ""}`,
    );
  },

  getById: (id: string) =>
    api.get<University>(`/api/v1/admin/universities/${id}`),

  create: (data: CreateUniversityInput) =>
    api.post<University>("/api/v1/admin/universities", data),

  update: (id: string, data: UpdateUniversityInput) =>
    api.patch<University>(`/api/v1/admin/universities/${id}`, data),

  archive: (id: string) =>
    api.patch<University>(`/api/v1/admin/universities/${id}/archive`, {}),

  activate: (id: string) =>
    api.patch<University>(`/api/v1/admin/universities/${id}/activate`, {}),

  deactivate: (id: string) =>
    api.patch<University>(`/api/v1/admin/universities/${id}/deactivate`, {}),
};
