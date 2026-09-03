import { api, type OffsetPaginationMeta } from "../api";
import type {
  CollegePermissionDto,
  CollegeRoleDto,
  CourseMinimalItem,
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
  collegeType: string | null;
  pinCode: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  communityLinkUrl: string | null;
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
  coverImageUrl?: string | null;
  referralCommissionAmount?: number | null;
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
  collegeType?: string;
  pinCode?: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  communityLinkUrl?: string | null;
  requestedGroupCode?: string | null;
  profileSections?: Record<string, any>;
  registrationTabs?: string[];
  leadId?: string | null;
  addressFromLead?: boolean;
  settings?: Record<string, unknown>;
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
  coverImageUrl?: string | null;
  referralCommissionAmount?: number | null;
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

export async function getCollegeCoursesMinimal(): Promise<CourseMinimalItem[]> {
  return api.get<CourseMinimalItem[]>("/api/v1/college-admin/courses/minimal");
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
  description?: string | null;
  totalBeds: number;
  availableBeds: number;
  annualPlanPrice: number;
  admissionFee?: number;
  securityDeposit: number;
  photos?: string[];
}

export interface HostelTagDto {
  label: string;
  color?: string;
}

export interface HostelSafetyFeatureDto {
  label: string;
}

export interface HostelWardenInfoDto {
  name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  photo?: string;
  designation?: string;
  safetyFeatures?: HostelSafetyFeatureDto[];
}

export interface HostelAmenityDto {
  name: string;
  icon?: string;
}

export interface HostelRuleDto {
  title: string;
  description: string;
}

export interface HostelNearbyEssentialDto {
  type: string;
  name: string;
  distance: string;
}

export interface HostelCollegeTransportDto {
  description?: string;
  busStopNote?: string;
}

export interface HostelMapDto {
  thumbnail?: string;
}

export interface HostelUtilityDto {
  category: string;
  provider: string;
  notes?: string;
}

export interface HostelTransitRouteDto {
  route: string;
  stop?: string;
  timing?: string;
}

export interface HostelLocationInfoDto {
  address?: string;
  addressLine2?: string;
  latitude?: number;
  longitude?: number;
  mapLink?: string;
  nearbyEssentials?: HostelNearbyEssentialDto[];
  collegeTransport?: HostelCollegeTransportDto;
  map?: HostelMapDto;
  utilities?: HostelUtilityDto[];
  transit?: HostelTransitRouteDto[];
}

export interface HostelMessPlanDto {
  id: string;
  name: string;
  description: string | null;
  mealsIncluded: string[];
  priceMonthly: number;
  duration: string;
  isCompulsory: boolean;
  dietaryOptions: string[];
}

export interface HostelAddonPlanItemDto {
  label: string;
  price: number;
  feature_tags?: string[];
}

export interface HostelAddonServiceDto {
  id: string;
  serviceType: string;
  name: string;
  description: string | null;
  isOptional: boolean;
  plans: HostelAddonPlanItemDto[];
  notes: string | null;
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
  coverImageUrl?: string | null;
  gallery?: string[];
  tags?: HostelTagDto[];
  badge?: string | null;
  safetyTier?: string | null;
  avgRating?: number;
  reviewCount?: number;
  wardenInfo?: HostelWardenInfoDto;
  amenities?: HostelAmenityDto[];
  rules?: HostelRuleDto[];
  locationInfo?: HostelLocationInfoDto;
  roomTypes: HostelRoomTypeDto[];
  messPlans?: HostelMessPlanDto[];
  addonServices?: HostelAddonServiceDto[];
}

export interface LibraryStatDto {
  value?: string;
  label?: string;
}

export interface LibraryResourceItemDto {
  name?: string;
  count?: string;
}

export interface LibraryHoursDayDto {
  day?: string;
  working_hours_start?: string;
  working_hours_end?: string;
  transaction_hours_start?: string;
  transaction_hours_end?: string;
}

export interface LibraryFacilityItemDto {
  name?: string;
  image?: string;
}

export interface LibraryDto {
  id: string;
  collegeId: string;
  departmentId: string | null;
  type: "central" | "department";
  name: string;
  coverImageUrl: string | null;
  stats: LibraryStatDto[];
  availableResources: { items: LibraryResourceItemDto[] };
  libraryHours: { days: LibraryHoursDayDto[] };
  facilities: { items: LibraryFacilityItemDto[] };
  status: string;
  department?: { id: string; name: string } | null;
}

export interface DepartmentDto {
  id: string;
  name: string;
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
  busType?: string | null;
  busModel?: string | null;
  totalSeats: number;
  availableSeats: number;
  driverName: string | null;
  driverPhone: string | null;
  driverStatus?: string;
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

export interface CreateCommuteStopInput {
  stopName: string;
  landmark?: string | null;
  morningTime?: string | null;
  eveningTime?: string | null;
  isPickupPoint?: boolean;
  stopOrder: number;
}

export interface CreateCommuteBusInput {
  busNumber: string;
  busName?: string | null;
  busType?: string | null;
  busModel?: string | null;
  totalSeats: number;
  driverName?: string | null;
  driverPhone?: string | null;
  driverStatus?: "on_route" | "off_duty" | "on_leave";
  monthlyFee?: number;
  paymentStructureNotes?: string | null;
}

export interface CreateCommuteRouteInput {
  name: string;
  description?: string | null;
  isVerified?: boolean;
  conductPolicy?: { title: string; description: string }[];
  stops?: CreateCommuteStopInput[];
  buses?: CreateCommuteBusInput[];
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

export async function getCollegeHostelDetail(id: string): Promise<HostelDto> {
  return api.get<HostelDto>(`/api/v1/college-admin/hostels/${id}`);
}

export async function updateCollegeHostel(
  id: string,
  data: any,
): Promise<HostelDto> {
  return api.patch<HostelDto>(`/api/v1/college-admin/hostels/${id}`, data);
}

export async function getCollegeLibraries(): Promise<LibraryDto[]> {
  return api.get<LibraryDto[]>("/api/v1/college-admin/libraries");
}

export async function createCollegeLibrary(data: any): Promise<LibraryDto> {
  return api.post<LibraryDto>("/api/v1/college-admin/libraries", data);
}

export async function getCollegeLibraryDetail(id: string): Promise<LibraryDto> {
  return api.get<LibraryDto>(`/api/v1/college-admin/libraries/${id}`);
}

export async function updateCollegeLibrary(
  id: string,
  data: any,
): Promise<LibraryDto> {
  return api.patch<LibraryDto>(`/api/v1/college-admin/libraries/${id}`, data);
}

export async function deleteCollegeLibrary(id: string): Promise<void> {
  return api.delete(`/api/v1/college-admin/libraries/${id}`);
}

export interface QuotaDto {
  id: string;
  collegeId: string;
  name: string;
  slug: string;
  bucketType: "in_state" | "out_of_state";
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  usage: { courseCount: number; seatPoolCount: number };
}

export interface CreateQuotaInput {
  name: string;
  bucketType: "in_state" | "out_of_state";
  description?: string | null;
  sortOrder?: number;
}

export type UpdateQuotaInput = Partial<CreateQuotaInput> & {
  isActive?: boolean;
};

export async function getCollegeQuotas(
  includeInactive = true,
): Promise<QuotaDto[]> {
  return api.get<QuotaDto[]>(
    `/api/v1/college-admin/quotas?include_inactive=${includeInactive}`,
  );
}

export async function createCollegeQuota(
  data: CreateQuotaInput,
): Promise<QuotaDto> {
  return api.post<QuotaDto>("/api/v1/college-admin/quotas", data);
}

export async function updateCollegeQuota(
  id: string,
  data: UpdateQuotaInput,
): Promise<QuotaDto> {
  return api.patch<QuotaDto>(`/api/v1/college-admin/quotas/${id}`, data);
}

export async function deleteCollegeQuota(id: string): Promise<void> {
  return api.delete(`/api/v1/college-admin/quotas/${id}`);
}

export interface QuotaUsageCourseRef {
  id: string;
  name: string;
  code: string;
}

export interface QuotaUsageSeatPool {
  id: string;
  totalSeats: number;
  openSeats: number;
  cycleId: string;
  cycleName: string;
  courses: QuotaUsageCourseRef[];
}

export interface QuotaUsageDetail {
  courses: QuotaUsageCourseRef[];
  seatPools: QuotaUsageSeatPool[];
}

export async function getCollegeQuotaUsage(
  id: string,
): Promise<QuotaUsageDetail> {
  return api.get<QuotaUsageDetail>(`/api/v1/college-admin/quotas/${id}/usage`);
}

export interface CourseQuotaDto {
  id: string;
  courseId: string;
  collegeQuotaId: string;
  appFeeAdjustmentType: "flat" | "percentage" | null;
  appFeeAdjustmentValue: string | null;
  tuitionFeeOverride: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  quotaName: string;
  quotaSlug: string;
  bucketType: "in_state" | "out_of_state";
  quotaIsActive: boolean;
}

export interface AttachCourseQuotaInput {
  collegeQuotaId: string;
  appFeeAdjustmentType?: "flat" | "percentage" | null;
  appFeeAdjustmentValue?: number | null;
  tuitionFeeOverride?: number | null;
}

export type UpdateCourseQuotaInput = Partial<
  Omit<AttachCourseQuotaInput, "collegeQuotaId">
> & { isActive?: boolean };

export async function getCourseQuotas(
  courseId: string,
): Promise<CourseQuotaDto[]> {
  return api.get<CourseQuotaDto[]>(
    `/api/v1/college-admin/courses/${courseId}/quotas`,
  );
}

export async function attachCourseQuota(
  courseId: string,
  data: AttachCourseQuotaInput,
): Promise<CourseQuotaDto> {
  return api.post<CourseQuotaDto>(
    `/api/v1/college-admin/courses/${courseId}/quotas`,
    data,
  );
}

export async function updateCourseQuota(
  courseId: string,
  courseQuotaId: string,
  data: UpdateCourseQuotaInput,
): Promise<CourseQuotaDto> {
  return api.patch<CourseQuotaDto>(
    `/api/v1/college-admin/courses/${courseId}/quotas/${courseQuotaId}`,
    data,
  );
}

export async function detachCourseQuota(
  courseId: string,
  courseQuotaId: string,
): Promise<void> {
  return api.delete(
    `/api/v1/college-admin/courses/${courseId}/quotas/${courseQuotaId}`,
  );
}

export interface FeeStructureInstalmentItem {
  label: string;
  amount: number;
  dueDate?: string;
  dueWithin?: string;
  dueBy?: string;
  dueAfter?: string;
}

export interface FeeStructureDto {
  id: string;
  courseId: string;
  collegeId: string;
  academicYear: string;
  feeCategory: string;
  amount: string;
  yearOrSemester: string | null;
  description: string | null;
  dueDate: string | null;
  gender: "both" | "male" | "female";
  instalmentAllowed: boolean;
  instalmentConfig: { instalments?: FeeStructureInstalmentItem[] };
  feePdfUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeeStructureInput {
  academicYear: string;
  feeCategory: string;
  amount: number;
  yearOrSemester?: string | null;
  description?: string | null;
  dueDate?: string | null;
  gender?: "both" | "male" | "female";
  instalmentAllowed?: boolean;
  instalmentConfig?: { instalments: FeeStructureInstalmentItem[] };
  feePdfUrl?: string | null;
}

export type UpdateFeeStructureInput = Partial<CreateFeeStructureInput> & {
  isActive?: boolean;
};

export async function getFeeStructures(
  courseId: string,
): Promise<FeeStructureDto[]> {
  return api.get<FeeStructureDto[]>(
    `/api/v1/college-admin/courses/${courseId}/fee-structures`,
  );
}

export async function createFeeStructure(
  courseId: string,
  data: CreateFeeStructureInput,
): Promise<FeeStructureDto> {
  return api.post<FeeStructureDto>(
    `/api/v1/college-admin/courses/${courseId}/fee-structures`,
    data,
  );
}

export async function updateFeeStructure(
  courseId: string,
  feeStructureId: string,
  data: UpdateFeeStructureInput,
): Promise<FeeStructureDto> {
  return api.patch<FeeStructureDto>(
    `/api/v1/college-admin/courses/${courseId}/fee-structures/${feeStructureId}`,
    data,
  );
}

export async function deleteFeeStructure(
  courseId: string,
  feeStructureId: string,
): Promise<void> {
  return api.delete(
    `/api/v1/college-admin/courses/${courseId}/fee-structures/${feeStructureId}`,
  );
}

export async function getCollegeDepartments(): Promise<DepartmentDto[]> {
  return api.get<DepartmentDto[]>("/api/v1/college-admin/lookups/departments");
}

export async function createHostelRoomType(
  hostelId: string,
  data: any,
): Promise<HostelRoomTypeDto> {
  return api.post<HostelRoomTypeDto>(
    `/api/v1/college-admin/hostels/${hostelId}/room-types`,
    data,
  );
}

export async function updateHostelRoomType(
  hostelId: string,
  id: string,
  data: any,
): Promise<HostelRoomTypeDto> {
  return api.patch<HostelRoomTypeDto>(
    `/api/v1/college-admin/hostels/${hostelId}/room-types/${id}`,
    data,
  );
}

export async function deleteHostelRoomType(
  hostelId: string,
  id: string,
): Promise<void> {
  return api.delete(
    `/api/v1/college-admin/hostels/${hostelId}/room-types/${id}`,
  );
}

export async function createHostelMessPlan(
  hostelId: string,
  data: any,
): Promise<HostelMessPlanDto> {
  return api.post<HostelMessPlanDto>(
    `/api/v1/college-admin/hostels/${hostelId}/mess-plans`,
    data,
  );
}

export async function updateHostelMessPlan(
  hostelId: string,
  id: string,
  data: any,
): Promise<HostelMessPlanDto> {
  return api.patch<HostelMessPlanDto>(
    `/api/v1/college-admin/hostels/${hostelId}/mess-plans/${id}`,
    data,
  );
}

export async function deleteHostelMessPlan(
  hostelId: string,
  id: string,
): Promise<void> {
  return api.delete(
    `/api/v1/college-admin/hostels/${hostelId}/mess-plans/${id}`,
  );
}

export async function createHostelAddonService(
  hostelId: string,
  data: any,
): Promise<HostelAddonServiceDto> {
  return api.post<HostelAddonServiceDto>(
    `/api/v1/college-admin/hostels/${hostelId}/addon-services`,
    data,
  );
}

export async function updateHostelAddonService(
  hostelId: string,
  id: string,
  data: any,
): Promise<HostelAddonServiceDto> {
  return api.patch<HostelAddonServiceDto>(
    `/api/v1/college-admin/hostels/${hostelId}/addon-services/${id}`,
    data,
  );
}

export async function deleteHostelAddonService(
  hostelId: string,
  id: string,
): Promise<void> {
  return api.delete(
    `/api/v1/college-admin/hostels/${hostelId}/addon-services/${id}`,
  );
}

export async function getCollegeCommuteRoutes(): Promise<CommuteRouteDto[]> {
  return api.get<CommuteRouteDto[]>("/api/v1/college-admin/commute");
}

export async function createCollegeCommuteRoute(
  data: CreateCommuteRouteInput,
): Promise<CommuteRouteDto> {
  return api.post<CommuteRouteDto>("/api/v1/college-admin/commute", data);
}

export async function deleteCollegeCommuteRoute(id: string): Promise<void> {
  return api.delete(`/api/v1/college-admin/commute/${id}`);
}

export interface CommuteEnrollmentDto {
  id: string;
  status: string;
  enrolledFrom: string;
  enrolledUntil: string | null;
  createdAt: string;
  student: {
    id: string;
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
    phoneCountryCode: string | null;
  };
  route: { id: string; name: string };
  bus: {
    id: string;
    busNumber: string;
    busName: string | null;
    driverName: string | null;
    driverPhone: string | null;
    driverStatus: string;
    monthlyFee: string;
  };
  pickupStop: {
    id: string;
    stopName: string;
    morningTime: string | null;
    eveningTime: string | null;
  };
}

export interface CommuteEnrollmentFilters {
  route_id?: string;
  bus_id?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getCollegeCommuteEnrollments(
  filters: CommuteEnrollmentFilters = {},
): Promise<{ data: CommuteEnrollmentDto[]; meta: OffsetPaginationMeta }> {
  const params = new URLSearchParams();
  if (filters.route_id) params.set("route_id", filters.route_id);
  if (filters.bus_id) params.set("bus_id", filters.bus_id);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return api.getPaginated<CommuteEnrollmentDto[]>(
    `/api/v1/college-admin/commute/enrollments${qs ? `?${qs}` : ""}`,
  );
}

export interface CommuteEnrollmentTransactionDto {
  id: string;
  transactionNumber: string;
  amount: string;
  status: string;
  paymentMethod: string;
  paidAt: string | null;
  createdAt: string;
}

export interface CommuteEnrollmentPaymentDto {
  id: string;
  description: string | null;
  amount: string;
  paidAmount: string;
  balanceAmount: string;
  status: string;
  createdAt: string;
  transactions: CommuteEnrollmentTransactionDto[];
}

export interface CommuteEnrollmentDetailDto extends CommuteEnrollmentDto {
  payments: CommuteEnrollmentPaymentDto[];
}

export async function getCollegeCommuteEnrollment(
  id: string,
): Promise<CommuteEnrollmentDetailDto> {
  return api.get<CommuteEnrollmentDetailDto>(
    `/api/v1/college-admin/commute/enrollments/${id}`,
  );
}

export interface HostelEnrollmentDto {
  id: string;
  status: string;
  roomPlanType: string;
  dietaryPreference: string | null;
  selectedAddons: { addon_service_id: string; plan_label: string }[];
  feeBreakdown: Record<string, unknown>;
  enrolledFrom: string;
  enrolledUntil: string | null;
  createdAt: string;
  student: {
    id: string;
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
    phoneCountryCode: string | null;
  };
  hostel: { id: string; name: string; hostelType: string };
  roomType: {
    id: string;
    name: string;
    annualPlanPrice: string | null;
    monthlyPlanPrice: string | null;
    admissionFee: string;
    securityDeposit: string;
  };
  messPlan: { id: string; name: string; priceMonthly: string } | null;
}

export interface HostelEnrollmentFilters {
  hostel_id?: string;
  room_type_id?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getCollegeHostelEnrollments(
  filters: HostelEnrollmentFilters = {},
): Promise<{ data: HostelEnrollmentDto[]; meta: OffsetPaginationMeta }> {
  const params = new URLSearchParams();
  if (filters.hostel_id) params.set("hostel_id", filters.hostel_id);
  if (filters.room_type_id) params.set("room_type_id", filters.room_type_id);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return api.getPaginated<HostelEnrollmentDto[]>(
    `/api/v1/college-admin/hostels/enrollments${qs ? `?${qs}` : ""}`,
  );
}

export interface HostelEnrollmentTransactionDto {
  id: string;
  transactionNumber: string;
  amount: string;
  status: string;
  paymentMethod: string;
  paidAt: string | null;
  createdAt: string;
}

export interface HostelEnrollmentPaymentDto {
  id: string;
  description: string | null;
  amount: string;
  paidAmount: string;
  balanceAmount: string;
  status: string;
  createdAt: string;
  transactions: HostelEnrollmentTransactionDto[];
}

export interface HostelEnrollmentDetailDto extends HostelEnrollmentDto {
  payments: HostelEnrollmentPaymentDto[];
}

export async function getCollegeHostelEnrollment(
  id: string,
): Promise<HostelEnrollmentDetailDto> {
  return api.get<HostelEnrollmentDetailDto>(
    `/api/v1/college-admin/hostels/enrollments/${id}`,
  );
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
