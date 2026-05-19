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
  profileSections: Record<string, unknown>;
  settings: Record<string, unknown>;
}

export interface Campus {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  isMainCampus: boolean;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  studyMode: string;
  campus?: { id: string; name: string } | null;
  studyLevel?: { id: string; name: string } | null;
  discipline?: { id: string; name: string } | null;
  programType?: { id: string; name: string } | null;
}

export interface UpdateCollegeProfileInput {
  name?: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  district?: string;
  pinCode?: string;
  logoUrl?: string | null;
}

export interface CreateCampusInput {
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  isMainCampus?: boolean;
}

export interface CreateCourseInput {
  name: string;
  code: string;
  disciplineId: string;
  studyLevelId: string;
  programTypeId: string;
  studyMode: string;
  intakeCapacity?: number | null;
  duration?: string | null;
  eligibility?: string | null;
  campusId?: string | null;
}

export interface SubmitRegistrationResponse {
  success: boolean;
  status: string;
}

export async function getCollegeProfile(): Promise<CollegeProfile> {
  return api.get<CollegeProfile>("/api/v1/college-admin/profile");
}

export async function updateCollegeProfile(
  data: UpdateCollegeProfileInput,
): Promise<CollegeProfile> {
  return api.patch<CollegeProfile>("/api/v1/college-admin/profile", data);
}

export async function getCollegeCampuses(): Promise<Campus[]> {
  return api.get<Campus[]>("/api/v1/college-admin/campuses");
}

export async function createCollegeCampus(
  data: CreateCampusInput,
): Promise<Campus> {
  return api.post<Campus>("/api/v1/college-admin/campuses", data);
}

export async function getCollegeCourses(): Promise<Course[]> {
  return api.get<Course[]>("/api/v1/college-admin/courses");
}

export async function createCollegeCourse(
  data: CreateCourseInput,
): Promise<Course> {
  return api.post<Course>("/api/v1/college-admin/courses", data);
}

export async function submitCollegeRegistration(): Promise<SubmitRegistrationResponse> {
  return api.post<SubmitRegistrationResponse>(
    "/api/v1/college-admin/profile/submit",
  );
}
