import { api } from "../api";
import type { UniversityType } from "@beaconu/types";
import type {
  CreateUniversityTypeInput,
  UpdateUniversityTypeInput,
} from "@beaconu/validation";

export type {
  UniversityType,
  CreateUniversityTypeInput,
  UpdateUniversityTypeInput,
};

export const universityTypesService = {
  getAll: (isActive?: boolean) => {
    const params = isActive !== undefined ? `?is_active=${isActive}` : "";
    return api.get<UniversityType[]>(
      `/api/v1/admin/universities/types${params}`,
    );
  },

  getById: (id: string) =>
    api.get<UniversityType>(`/api/v1/admin/universities/types/${id}`),

  create: (data: CreateUniversityTypeInput) =>
    api.post<UniversityType>("/api/v1/admin/universities/types", data),

  update: (id: string, data: UpdateUniversityTypeInput) =>
    api.patch<UniversityType>(`/api/v1/admin/universities/types/${id}`, data),

  disable: (id: string) =>
    api.patch<UniversityType>(
      `/api/v1/admin/universities/types/${id}/disable`,
      {},
    ),

  remove: (id: string) => api.delete(`/api/v1/admin/universities/types/${id}`),
};
