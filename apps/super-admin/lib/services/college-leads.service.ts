import { api } from "../api";

export interface CollegeLead {
  id: string;
  collegeName: string;
  universityName: string | null;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string | null;
  city: string | null;
  state: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  reviewRemarks: string | null;
  reviewer: { id: string; name: string } | null;
  createdCollegeId: string | null;
  createdCollege?: {
    id: string;
    slug: string;
    ownedGroupCode?: string | null;
  } | null;
  groupCode?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStatusResponse {
  id: string;
  status: string;
  reviewRemarks: string | null;
  updatedAt: string;
  provisionedCollege?: {
    id: string;
    name: string;
    slug: string;
    code: string;
    adminEmail: string;
    setupUrl: string;
    groupCode?: string | null;
  };
}

export interface CollegeLeadStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface CollegeLeadsListResponse {
  data: CollegeLead[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const collegeLeadsService = {
  getAll: (filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.search) params.set("search", filters.search);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));
    const query = params.toString();
    return api.get<CollegeLeadsListResponse>(
      `/api/v1/admin/college-leads${query ? `?${query}` : ""}`,
    );
  },

  getById: (id: string) =>
    api.get<CollegeLead>(`/api/v1/admin/college-leads/${id}`),

  getStats: () =>
    api.get<CollegeLeadStats>("/api/v1/admin/college-leads/stats"),

  updateStatus: (
    id: string,
    status: string,
    review_remarks?: string,
    enableInstitutionGroup?: boolean,
  ) =>
    api.patch<UpdateStatusResponse>(
      `/api/v1/admin/college-leads/${id}/status`,
      {
        status,
        review_remarks,
        enableInstitutionGroup,
      },
    ),
};
