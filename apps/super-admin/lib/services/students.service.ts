import { api, type Paginated } from "../api";
import type {
  AdminStudentListItem,
  ListStudentsQuery,
  StudentProfile,
  UpdateStudentStatusInput,
} from "@beaconu/types";

export const studentsService = {
  getAll: (
    filters?: ListStudentsQuery,
  ): Promise<Paginated<AdminStudentListItem>> => {
    const query = new URLSearchParams();
    if (filters?.search) query.set("search", filters.search);
    if (filters?.status) query.set("status", filters.status);
    if (filters?.source) query.set("source", filters.source);
    query.set("page", String(filters?.page ?? 1));
    query.set("limit", String(filters?.limit ?? 20));
    return api.getPaginated<AdminStudentListItem>(
      `/api/v1/admin/students?${query.toString()}`,
    );
  },

  getById: (id: string) =>
    api.get<StudentProfile>(`/api/v1/admin/students/${id}`),

  updateStatus: (id: string, data: UpdateStudentStatusInput) =>
    api.patch<StudentProfile>(`/api/v1/admin/students/${id}/status`, data),
};
