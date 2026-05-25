import { api, type Paginated } from "../api";
import type {
  EducationLoan,
  EducationLoanListItem,
  CreateEducationLoanInput,
  UpdateEducationLoanInput,
} from "@beaconu/types";

export const financialAidLoansService = {
  list: (params?: {
    status?: string;
    loan_type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Paginated<EducationLoanListItem>> => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.loan_type) query.set("loan_type", params.loan_type);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    query.set("limit", String(params?.limit ?? 12));
    return api.getPaginated<EducationLoanListItem>(
      `/api/v1/admin/financial-aid/loans?${query.toString()}`,
    );
  },

  getById: (id: string) =>
    api.get<EducationLoan>(`/api/v1/admin/financial-aid/loans/${id}`),

  create: (data: CreateEducationLoanInput) =>
    api.post<EducationLoan>("/api/v1/admin/financial-aid/loans", data),

  update: (id: string, data: UpdateEducationLoanInput) =>
    api.patch<EducationLoan>(`/api/v1/admin/financial-aid/loans/${id}`, data),

  deactivate: (id: string) =>
    api.patch<EducationLoan>(
      `/api/v1/admin/financial-aid/loans/${id}/deactivate`,
      {},
    ),

  activate: (id: string) =>
    api.patch<EducationLoan>(
      `/api/v1/admin/financial-aid/loans/${id}/activate`,
      {},
    ),
};
