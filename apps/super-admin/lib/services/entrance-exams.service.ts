import { api, type Paginated } from "../api";
import type {
  EntranceExam,
  EntranceExamListItem,
  CreateEntranceExamInput,
  UpdateEntranceExamInput,
} from "@beaconu/types";

export const entranceExamsService = {
  list: (params?: {
    status?: string;
    exam_level?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Paginated<EntranceExamListItem>> => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.exam_level) query.set("exam_level", params.exam_level);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    query.set("limit", String(params?.limit ?? 12));
    return api.getPaginated<EntranceExamListItem>(
      `/api/v1/admin/entrance-exams?${query.toString()}`,
    );
  },

  getById: (id: string) =>
    api.get<EntranceExam>(`/api/v1/admin/entrance-exams/${id}`),

  create: (data: CreateEntranceExamInput) =>
    api.post<EntranceExam>("/api/v1/admin/entrance-exams", data),

  update: (id: string, data: UpdateEntranceExamInput) =>
    api.patch<EntranceExam>(`/api/v1/admin/entrance-exams/${id}`, data),

  deactivate: (id: string) =>
    api.patch<EntranceExam>(
      `/api/v1/admin/entrance-exams/${id}/deactivate`,
      {},
    ),

  activate: (id: string) =>
    api.patch<EntranceExam>(`/api/v1/admin/entrance-exams/${id}/activate`, {}),
};
