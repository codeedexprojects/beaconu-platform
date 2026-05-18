import { api } from "../api";

export interface CollegeProfile {
  name: string;
  code: string;
  slug: string;
  universityId: string | null;
  domain: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  district: string | null;
  pinCode: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  profileSections: Record<string, any>;
  settings: Record<string, any>;
}

export const collegesService = {
  getProfile: () => api.get<CollegeProfile>("/api/v1/college-admin/profile"),

  updateProfile: (data: Partial<CollegeProfile>) =>
    api.patch<CollegeProfile>("/api/v1/college-admin/profile", data),

  getCampuses: () => api.get<any[]>("/api/v1/college-admin/campuses"),

  createCampus: (data: any) =>
    api.post<any>("/api/v1/college-admin/campuses", data),

  getCourses: () => api.get<any[]>("/api/v1/college-admin/courses"),

  createCourse: (data: any) =>
    api.post<any>("/api/v1/college-admin/courses", data),

  submitRegistration: () =>
    api.post<{ success: boolean; status: string }>(
      "/api/v1/college-admin/profile/submit",
    ),
};
