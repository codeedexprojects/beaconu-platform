import { api } from "../api";
import type {
  CollegePermissionDto,
  CollegeRoleDto,
  CreateCollegeRoleInput,
  UpdateCollegeRoleInput,
} from "@beaconu/types";

export interface CollegeProfile {
  id: string;
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
  requestedGroupCode: string | null;
  profileSections?: Record<string, any>;
  tabs?: string[];
  collegeDetails?: Record<string, any>;
  settings: Record<string, unknown>;
  totalCourses?: number;
  instituteType?: string | null;
  campusAmbassadors?: any[];
  leadId?: string | null;
  addressFromLead?: boolean;
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
  coverImageUrl?: string | null;
  requestedGroupCode?: string | null;
  profileSections?: Record<string, any>;
  registrationTabs?: string[];
  leadId?: string | null;
  addressFromLead?: boolean;
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
  tabs?: string[];
  tabData?: Record<string, unknown>;
}

export interface SubmitRegistrationResponse {
  success: boolean;
  status: string;
}

export interface CollegeAdminUploadPresignResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

export interface CollegeAdminUploadVerifyResponse {
  verified: boolean;
  permanentUrl: string;
  viewUrl: string;
}

type CollegeProfileSections = Record<string, any>;

async function getCollegeProfileSections(): Promise<CollegeProfileSections> {
  return api.get<CollegeProfileSections>(
    "/api/v1/college-admin/profile/sections",
  );
}

function normalizeCollegeProfileResponse(
  profile: CollegeProfile,
  profileSections: CollegeProfileSections,
): CollegeProfile {
  const collegeDetails =
    profile.collegeDetails && typeof profile.collegeDetails === "object"
      ? (profile.collegeDetails as Record<string, any>)
      : {};

  return {
    ...collegeDetails,
    ...profile,
    profileSections,
  };
}

export async function getCollegeProfile(): Promise<CollegeProfile> {
  const [profile, profileSections] = await Promise.all([
    api.get<CollegeProfile>("/api/v1/college-admin/profile"),
    getCollegeProfileSections(),
  ]);

  return normalizeCollegeProfileResponse(profile, profileSections);
}

export async function updateCollegeProfile(
  data: UpdateCollegeProfileInput,
): Promise<CollegeProfile> {
  const updatedProfile = await api.patch<CollegeProfile>(
    "/api/v1/college-admin/profile",
    data,
  );
  const profileSections = await getCollegeProfileSections();

  return normalizeCollegeProfileResponse(updatedProfile, profileSections);
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

export async function updateCollegeCourse(
  id: string,
  data: Partial<CreateCourseInput>,
): Promise<Course> {
  return api.patch<Course>(`/api/v1/college-admin/courses/${id}`, data);
}

export async function deleteCollegeCourse(id: string): Promise<void> {
  return api.delete(`/api/v1/college-admin/courses/${id}`);
}

export async function getCourseTabs(
  id: string,
): Promise<{ tabs: string[]; tabData: Record<string, any> }> {
  const response = await api.get<{
    tabs: string[];
    tabData: Record<string, any>;
  }>(`/api/v1/college-admin/courses/${id}/tabs`);
  return response;
}

export async function updateCourseTab(
  courseId: string,
  tabName: string,
  data: { data: any },
): Promise<any> {
  return api.patch<any>(
    `/api/v1/college-admin/courses/${courseId}/tabs/${tabName}`,
    data,
  );
}

export async function submitCollegeRegistration(): Promise<SubmitRegistrationResponse> {
  return api.post<SubmitRegistrationResponse>(
    "/api/v1/college-admin/profile/submit",
  );
}

export async function presignCollegeAdminUpload(input: {
  mimeType: string;
  fileSizeBytes: number;
  context: string;
}): Promise<CollegeAdminUploadPresignResponse> {
  return api.post<CollegeAdminUploadPresignResponse>(
    "/api/v1/college-admin/uploads/presign",
    input,
  );
}

export async function verifyCollegeAdminUpload(
  key: string,
): Promise<CollegeAdminUploadVerifyResponse> {
  return api.post<CollegeAdminUploadVerifyResponse>(
    "/api/v1/college-admin/uploads/verify",
    { key },
  );
}

export async function uploadCollegeAdminFile(
  file: File,
  context: string,
): Promise<string> {
  if (!file.type) {
    throw new Error("Selected file has no MIME type");
  }

  const presigned = await presignCollegeAdminUpload({
    mimeType: file.type,
    fileSizeBytes: file.size,
    context,
  });

  let uploadResponse: Response;
  try {
    uploadResponse = await fetch(presigned.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Upload blocked by S3 CORS (preflight failed). Configure bucket CORS to allow PUT/GET/HEAD from your college-admin origin.",
      );
    }
    throw error;
  }

  if (!uploadResponse.ok) {
    throw new Error(
      `Failed to upload file to storage (HTTP ${uploadResponse.status})`,
    );
  }

  const verified = await verifyCollegeAdminUpload(presigned.key);
  return verified.permanentUrl;
}

// ── Roles & Staff Directory Services ──
export type {
  CollegePermissionDto,
  CollegeRoleDto,
  CreateCollegeRoleInput,
  UpdateCollegeRoleInput,
} from "@beaconu/types";

export interface StaffMemberDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  status: "active" | "inactive";
  collegeRoleId: string;
  collegeRole: { id: string; name: string; slug: string };
  createdAt: string;
}

export interface InviteStaffInput {
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  password?: string;
  collegeRoleId: string;
}

export async function getCollegePermissions(): Promise<CollegePermissionDto[]> {
  return api.get<CollegePermissionDto[]>("/api/v1/college-admin/permissions");
}

export async function getCollegeRoles(): Promise<CollegeRoleDto[]> {
  return api.get<CollegeRoleDto[]>("/api/v1/college-admin/roles");
}

export async function createCollegeRole(
  data: CreateCollegeRoleInput,
): Promise<CollegeRoleDto> {
  return api.post<CollegeRoleDto>("/api/v1/college-admin/roles", data);
}

export async function updateCollegeRole(
  id: string,
  data: UpdateCollegeRoleInput,
): Promise<CollegeRoleDto> {
  return api.patch<CollegeRoleDto>(`/api/v1/college-admin/roles/${id}`, data);
}

export async function deleteCollegeRole(id: string): Promise<void> {
  return api.delete(`/api/v1/college-admin/roles/${id}`);
}

export async function getStaffDirectory(): Promise<StaffMemberDto[]> {
  return api.get<StaffMemberDto[]>("/api/v1/college-admin/staff");
}

export async function inviteStaffMember(
  data: InviteStaffInput,
): Promise<StaffMemberDto> {
  return api.post<StaffMemberDto>("/api/v1/college-admin/staff", data);
}

export async function updateStaffMember(
  id: string,
  data: { collegeRoleId?: string; status?: "active" | "inactive" },
): Promise<StaffMemberDto> {
  return api.patch<StaffMemberDto>(`/api/v1/college-admin/staff/${id}`, data);
}

export interface HostelRoomTypeDto {
  id: string;
  name: string;
  totalBeds: number;
  availableBeds: number;
  annualPlanPrice: number;
  securityDeposit: number;
}

export interface HostelDto {
  id: string;
  name: string;
  slug: string;
  hostelType: "boys" | "girls" | "co-ed";
  isOnCampus: boolean;
  distanceFromCampus: string | null;
  description: string | null;
  totalBeds: number;
  roomTypes: HostelRoomTypeDto[];
}

export interface CommuteStopDto {
  id: string;
  stopName: string;
  landmark: string | null;
  morningTime?: string | null;
  eveningTime?: string | null;
  isPickupPoint?: boolean;
  stopOrder: number;
}

export interface CommuteBusDto {
  id: string;
  busNumber: string;
  busName: string | null;
  busModel?: string | null;
  totalSeats: number;
  availableSeats: number;
  driverName: string | null;
  driverPhone: string | null;
  monthlyFee: number;
  paymentStructureNotes?: string | null;
}

export interface CommuteRouteDto {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isVerified?: boolean;
  conductPolicy?: { title: string; description: string }[];
  stops: CommuteStopDto[];
  buses: CommuteBusDto[];
}

export async function getCollegeHostels(): Promise<HostelDto[]> {
  return api.get<HostelDto[]>("/api/v1/college-admin/hostels");
}

export async function createCollegeHostel(data: any): Promise<HostelDto> {
  return api.post<HostelDto>("/api/v1/college-admin/hostels", data);
}

export async function deleteCollegeHostel(id: string): Promise<void> {
  return api.delete(`/api/v1/college-admin/hostels/${id}`);
}

export async function getCollegeCommuteRoutes(): Promise<CommuteRouteDto[]> {
  return api.get<CommuteRouteDto[]>("/api/v1/college-admin/commute");
}

export async function createCollegeCommuteRoute(
  data: any,
): Promise<CommuteRouteDto> {
  return api.post<CommuteRouteDto>("/api/v1/college-admin/commute", data);
}

export async function deleteCollegeCommuteRoute(id: string): Promise<void> {
  return api.delete(`/api/v1/college-admin/commute/${id}`);
}

export interface MyGroupMembershipResponse {
  type: "owner" | "member";
  group?: {
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
    members: Array<{
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
    }>;
  };
  membership?: {
    id: string;
    groupId: string;
    collegeId: string;
    role: string;
    joinedVia: string;
    joinedAt: string;
    group: {
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
      members: Array<{
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
      }>;
    };
  };
}

export async function getMyInstitutionGroup(): Promise<MyGroupMembershipResponse | null> {
  return api.get<MyGroupMembershipResponse | null>(
    "/api/v1/college-admin/institution-group",
  );
}

export async function joinInstitutionGroup(group_code: string): Promise<any> {
  return api.post<any>("/api/v1/college-admin/institution-group/join", {
    group_code,
  });
}
