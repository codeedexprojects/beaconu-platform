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
    adminSetupCompleted: boolean;
    setupUrl?: string | null;
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

export interface CollegeLeadUpsertInput {
  collegeName: string;
  universityName?: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhone?: string;
  city?: string;
  state?: string;
  groupCode?: string;
  message?: string;
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

  create: (data: CollegeLeadUpsertInput) =>
    api.post<CollegeLead>("/api/v1/admin/college-leads", {
      college_name: data.collegeName,
      university_name: data.universityName,
      contact_person_name: data.contactPersonName,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone,
      city: data.city,
      state: data.state,
      group_code: data.groupCode,
      message: data.message,
    }),

  update: (id: string, data: CollegeLeadUpsertInput) =>
    api.patch<CollegeLead>(`/api/v1/admin/college-leads/${id}`, {
      college_name: data.collegeName,
      university_name: data.universityName,
      contact_person_name: data.contactPersonName,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone,
      city: data.city,
      state: data.state,
      group_code: data.groupCode,
      message: data.message,
    }),

  updateStatus: (
    id: string,
    status: string,
    review_remarks?: string,
    enableInstitutionGroup?: boolean,
    universityId?: string,
  ) =>
    api.patch<UpdateStatusResponse>(
      `/api/v1/admin/college-leads/${id}/status`,
      {
        status,
        review_remarks,
        enableInstitutionGroup,
        universityId,
      },
    ),
};
