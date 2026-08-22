import { api, type Paginated } from "../api";
import type {
  InstituteOfNationalImportanceItem,
  CreateInstituteOfNationalImportanceInput,
  UpdateInstituteOfNationalImportanceInput,
} from "@beaconu/types";

export type {
  InstituteOfNationalImportanceItem,
  CreateInstituteOfNationalImportanceInput,
  UpdateInstituteOfNationalImportanceInput,
};

export const institutesOfNationalImportanceService = {
  getAll: (filters?: {
    is_active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Paginated<InstituteOfNationalImportanceItem>> => {
    const query = new URLSearchParams();
    if (filters?.is_active !== undefined) {
      query.set("is_active", String(filters.is_active));
    }
    if (filters?.search) query.set("search", filters.search);
    query.set("page", String(filters?.page ?? 1));
    query.set("limit", String(filters?.limit ?? 50));
    return api.getPaginated<InstituteOfNationalImportanceItem>(
      `/api/v1/admin/institutes-of-national-importance?${query.toString()}`,
    );
  },

  getById: (id: string) =>
    api.get<InstituteOfNationalImportanceItem>(
      `/api/v1/admin/institutes-of-national-importance/${id}`,
    ),

  create: (data: CreateInstituteOfNationalImportanceInput) =>
    api.post<InstituteOfNationalImportanceItem>(
      "/api/v1/admin/institutes-of-national-importance",
      data,
    ),

  update: (id: string, data: UpdateInstituteOfNationalImportanceInput) =>
    api.patch<InstituteOfNationalImportanceItem>(
      `/api/v1/admin/institutes-of-national-importance/${id}`,
      data,
    ),

  deactivate: (id: string) =>
    api.patch<InstituteOfNationalImportanceItem>(
      `/api/v1/admin/institutes-of-national-importance/${id}/deactivate`,
      {},
    ),

  activate: (id: string) =>
    api.patch<InstituteOfNationalImportanceItem>(
      `/api/v1/admin/institutes-of-national-importance/${id}/activate`,
      {},
    ),
};
