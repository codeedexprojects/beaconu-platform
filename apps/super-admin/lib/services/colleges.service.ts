import { api } from "../api";

export interface CollegeSummary {
  id: string;
  name: string;
  slug: string;
  code: string;
  city: string | null;
  state: string | null;
  status: "pending_setup" | "active" | string;
  logoUrl: string | null;
  createdAt: string;
  university: { id: string; name: string } | null;
  _count: {
    campuses: number;
    courses: number;
    staffMembers: number;
  };
}

export interface CollegeDetail extends CollegeSummary {
  domain: string | null;
  coverImageUrl: string | null;
  address: string | null;
  district: string | null;
  pinCode: string | null;
  profileSections: Record<string, unknown>;
  settings: Record<string, unknown>;
  campuses: Array<{
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    isMainCampus: boolean;
    status: string;
  }>;
  courses: Array<{
    id: string;
    name: string;
    code: string;
    studyMode: string;
    intakeCapacity: number | null;
    discipline: { name: string; stream: { name: string } };
    studyLevel: { name: string };
    programType: { name: string };
  }>;
  staffMembers: Array<{
    id: string;
    fullName: string;
    email: string;
    collegeRole: { name: string; slug: string };
  }>;
}

export interface CollegesListResponse {
  data: CollegeSummary[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface CollegeStats {
  total: number;
  pending: number;
  active: number;
}

export interface InstitutionGroupMember {
  id: string;
  role: string;
  joinedVia: string;
  joinedAt: string;
  college: {
    id: string;
    name: string;
    slug: string;
    code: string;
    city: string | null;
    state: string | null;
    status: string;
    logoUrl: string | null;
  };
}

export interface InstitutionGroup {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  groupCode: string;
  createdByCollegeId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdByCollege: {
    id: string;
    name: string;
    slug: string;
    code: string;
  };
  members: InstitutionGroupMember[];
}

export const collegesService = {
  getAll: (filters?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));
    const query = params.toString();
    return api.get<CollegesListResponse>(
      `/api/v1/admin/colleges${query ? `?${query}` : ""}`,
    );
  },

  getById: (id: string) =>
    api.get<CollegeDetail>(`/api/v1/admin/colleges/${id}`),

  getStats: () => api.get<CollegeStats>("/api/v1/admin/colleges/stats"),

  // ── Institution Group ─────────────────────────────────────────────────
  getGroup: (collegeId: string) =>
    api.get<InstitutionGroup | null>(
      `/api/v1/admin/colleges/${collegeId}/group`,
    ),

  enableGroup: (
    collegeId: string,
    data: { name: string; description?: string },
  ) =>
    api.post<InstitutionGroup>(
      `/api/v1/admin/colleges/${collegeId}/group/enable`,
      data,
    ),

  disableGroup: (collegeId: string) =>
    api.post<InstitutionGroup>(
      `/api/v1/admin/colleges/${collegeId}/group/disable`,
      {},
    ),
};
