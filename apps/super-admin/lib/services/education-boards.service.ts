import { api, type Paginated } from "../api";
import type {
  EducationBoardItem,
  CreateEducationBoardInput,
  UpdateEducationBoardInput,
} from "@beaconu/types";

export type {
  EducationBoardItem,
  CreateEducationBoardInput,
  UpdateEducationBoardInput,
};

export const educationBoardsService = {
  getAll: (filters?: {
    grade?: string;
    is_active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Paginated<EducationBoardItem>> => {
    const query = new URLSearchParams();
    if (filters?.grade) query.set("grade", filters.grade);
    if (filters?.is_active !== undefined) {
      query.set("is_active", String(filters.is_active));
    }
    if (filters?.search) query.set("search", filters.search);
    query.set("page", String(filters?.page ?? 1));
    query.set("limit", String(filters?.limit ?? 50));
    return api.getPaginated<EducationBoardItem>(
      `/api/v1/admin/education-boards?${query.toString()}`,
    );
  },

  getById: (id: string) =>
    api.get<EducationBoardItem>(`/api/v1/admin/education-boards/${id}`),

  create: (data: CreateEducationBoardInput) =>
    api.post<EducationBoardItem>("/api/v1/admin/education-boards", data),

  update: (id: string, data: UpdateEducationBoardInput) =>
    api.patch<EducationBoardItem>(`/api/v1/admin/education-boards/${id}`, data),

  deactivate: (id: string) =>
    api.patch<EducationBoardItem>(
      `/api/v1/admin/education-boards/${id}/deactivate`,
      {},
    ),

  activate: (id: string) =>
    api.patch<EducationBoardItem>(
      `/api/v1/admin/education-boards/${id}/activate`,
      {},
    ),
};
