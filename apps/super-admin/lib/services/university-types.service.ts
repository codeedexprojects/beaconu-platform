import { api } from "../api";

export interface UniversityType {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUniversityTypeInput {
  name: string;
  slug: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateUniversityTypeInput {
  name?: string;
  slug?: string;
  sort_order?: number;
  is_active?: boolean;
}

export const universityTypesService = {
  getAll: (isActive?: boolean) => {
    const params = isActive !== undefined ? `?is_active=${isActive}` : "";
    return api.get<UniversityType[]>(`/api/v1/admin/university-types${params}`);
  },

  getById: (id: string) =>
    api.get<UniversityType>(`/api/v1/admin/university-types/${id}`),

  create: (data: CreateUniversityTypeInput) =>
    api.post<UniversityType>("/api/v1/admin/university-types", data),

  update: (id: string, data: UpdateUniversityTypeInput) =>
    api.patch<UniversityType>(`/api/v1/admin/university-types/${id}`, data),

  disable: (id: string) =>
    api.patch<UniversityType>(
      `/api/v1/admin/university-types/${id}/disable`,
      {},
    ),

  remove: (id: string) => api.delete(`/api/v1/admin/university-types/${id}`),
};
