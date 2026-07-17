import { cache } from "react";
import { api } from "@/lib/api";
import type {
  PublicCourseDetail,
  PublicCollegeSectionResponse,
  PublicAdmissionPolicyTab,
  PublicFeesTab,
  PublicFinancialAidTab,
  PublicExamPolicyTab,
  PublicDemographicsTab,
  PublicPlacementsTab,
  PublicFacultyMember,
  PublicReviewTab,
  PublicCourseReviewsPage,
  PublicStudentHousingTab,
  PublicLibraryTab,
  PublicClubsListPage,
  PublicClubDetail,
  PublicAlliancePartner,
  PublicOtherCoursesPage,
  PublicEligibilityCriteria,
  PublicScholarshipDetailsResponse,
} from "@beaconu/types";

// Cached: called from the [courseId] layout AND from each tab page under it
// in the same render pass.
export const getCourseDetail = cache(
  async (slug: string, courseId: string): Promise<PublicCourseDetail> => {
    return api.get(
      `/api/v1/public/colleges/by-slug/${slug}/courses/${courseId}`,
    );
  },
);

export async function getCourseTab<T>(
  slug: string,
  courseId: string,
  tabName: string,
): Promise<PublicCollegeSectionResponse<T>> {
  return api.get(
    `/api/v1/public/colleges/by-slug/${slug}/courses/${courseId}/tabs/${tabName}`,
  );
}

export async function getAdmissionPolicyTab(
  slug: string,
  courseId: string,
): Promise<PublicCollegeSectionResponse<PublicAdmissionPolicyTab>> {
  return getCourseTab<PublicAdmissionPolicyTab>(
    slug,
    courseId,
    "admission_policy",
  );
}

// Fees is returned unwrapped (no {sectionName,...,data} envelope) — call
// api.get directly rather than the generic getCourseTab helper.
export async function getFeesTab(
  slug: string,
  courseId: string,
): Promise<PublicFeesTab> {
  return api.get(
    `/api/v1/public/colleges/by-slug/${slug}/courses/${courseId}/tabs/fees`,
  );
}

export async function getFinancialAidTab(
  slug: string,
  courseId: string,
): Promise<PublicCollegeSectionResponse<PublicFinancialAidTab>> {
  return getCourseTab<PublicFinancialAidTab>(slug, courseId, "financial_aid");
}

export async function getExamPolicyTab(
  slug: string,
  courseId: string,
): Promise<PublicCollegeSectionResponse<PublicExamPolicyTab>> {
  return getCourseTab<PublicExamPolicyTab>(slug, courseId, "exam_policy");
}

export async function getDemographicsTab(
  slug: string,
  courseId: string,
): Promise<PublicCollegeSectionResponse<PublicDemographicsTab>> {
  return getCourseTab<PublicDemographicsTab>(slug, courseId, "demo_graphics");
}

export async function getPlacementsTab(
  slug: string,
  courseId: string,
): Promise<PublicCollegeSectionResponse<PublicPlacementsTab>> {
  return getCourseTab<PublicPlacementsTab>(slug, courseId, "placements");
}

// Faculty is returned as a bare array (no envelope) — call api.get directly.
export async function getFacultyTab(
  slug: string,
  courseId: string,
): Promise<PublicFacultyMember[]> {
  return api.get(
    `/api/v1/public/colleges/by-slug/${slug}/courses/${courseId}/tabs/faculty`,
  );
}

export async function getReviewTab(
  slug: string,
  courseId: string,
): Promise<PublicCollegeSectionResponse<PublicReviewTab>> {
  return getCourseTab<PublicReviewTab>(slug, courseId, "review");
}

export async function getStudentHousingTab(
  slug: string,
  courseId: string,
): Promise<PublicCollegeSectionResponse<PublicStudentHousingTab>> {
  return getCourseTab<PublicStudentHousingTab>(
    slug,
    courseId,
    "student_housing",
  );
}

export async function getLibraryTab(
  slug: string,
  courseId: string,
): Promise<PublicCollegeSectionResponse<PublicLibraryTab>> {
  return getCourseTab<PublicLibraryTab>(slug, courseId, "library");
}

export async function getAllianceTab(
  slug: string,
  courseId: string,
): Promise<PublicCollegeSectionResponse<PublicAlliancePartner[]>> {
  return getCourseTab<PublicAlliancePartner[]>(slug, courseId, "alliance");
}

export async function getScholarshipDetails(
  slug: string,
  courseId: string,
  portEntryId?: string,
  scoreRangeId?: string,
): Promise<PublicScholarshipDetailsResponse> {
  const params = new URLSearchParams();
  if (portEntryId) params.set("port_entry_id", portEntryId);
  if (scoreRangeId) params.set("score_range_id", scoreRangeId);
  const query = params.toString() ? `?${params.toString()}` : "";
  return api.get(
    `/api/v1/public/colleges/by-slug/${slug}/courses/${courseId}/scholarship-details${query}`,
  );
}

export async function getEligibilityCriteria(
  slug: string,
  courseId: string,
  studentType?: string,
  quotaCategory?: string,
): Promise<PublicEligibilityCriteria> {
  const params = new URLSearchParams();
  if (studentType) params.set("student_type", studentType);
  if (quotaCategory) params.set("quota_category", quotaCategory);
  const query = params.toString() ? `?${params.toString()}` : "";
  return api.get(
    `/api/v1/public/colleges/by-slug/${slug}/courses/${courseId}/eligibility-criteria${query}`,
  );
}

export async function getOtherCoursesOffered(
  slug: string,
  courseId: string,
  page = 1,
  perPage = 10,
  search?: string,
): Promise<PublicOtherCoursesPage> {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
  return api.get(
    `/api/v1/public/colleges/by-slug/${slug}/courses/${courseId}/other-courses-offered?page=${page}&per_page=${perPage}${searchParam}`,
  );
}

export async function getClubsList(
  slug: string,
  courseId: string,
  page = 1,
  perPage = 12,
  search?: string,
): Promise<PublicClubsListPage> {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
  return api.get(
    `/api/v1/public/colleges/by-slug/${slug}/courses/${courseId}/clubs-associations?page=${page}&per_page=${perPage}${searchParam}`,
  );
}

export async function getClubDetail(
  slug: string,
  courseId: string,
  clubId: string,
): Promise<PublicClubDetail> {
  return api.get(
    `/api/v1/public/colleges/by-slug/${slug}/courses/${courseId}/clubs-associations/${clubId}`,
  );
}

export async function getCourseReviewsPage(
  slug: string,
  courseId: string,
  page: number,
  perPage = 10,
): Promise<PublicCourseReviewsPage> {
  return api.get(
    `/api/v1/public/colleges/by-slug/${slug}/courses/${courseId}/reviews?page=${page}&per_page=${perPage}`,
  );
}
