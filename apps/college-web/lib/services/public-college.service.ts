import { cache } from "react";
import { api } from "@/lib/api";
import type {
  PublicCollegeBySlugResponse,
  PublicCollegeOverviewSection,
  PublicCollegeSectionResponse,
  PublicCourseListItem,
  PublicScholarship,
  PublicGalleryItem,
  PublicCollegeReview,
  PublicInstitutionsAcrossWorldSection,
  PublicCommuteSection,
  PublicHappeningsSection,
  PublicCodeOfConductSection,
  AmbassadorOption,
  PublicSiteAnnouncement,
} from "@beaconu/types";

export const getCollegeBySlug = cache(
  async (slug: string): Promise<PublicCollegeBySlugResponse> => {
    return api.get(`/api/v1/public/colleges/by-slug/${slug}`);
  },
);

export async function getCollegeOverviewSection(
  collegeId: string,
): Promise<PublicCollegeSectionResponse<PublicCollegeOverviewSection>> {
  return api.get(
    `/api/v1/public/colleges/${collegeId}/section/college_overview`,
  );
}

export async function getCollegeCourses(
  slug: string,
): Promise<PublicCourseListItem[]> {
  return api.get(`/api/v1/public/colleges/by-slug/${slug}/courses`);
}

export async function getCollegeScholarships(
  slug: string,
): Promise<PublicScholarship[]> {
  return api.get(`/api/v1/public/colleges/by-slug/${slug}/scholarships`);
}

export async function getCollegeGallery(
  slug: string,
): Promise<PublicGalleryItem[]> {
  return api.get(`/api/v1/public/colleges/by-slug/${slug}/gallery`);
}

export async function getCollegeReviews(
  slug: string,
  limit = 10,
): Promise<PublicCollegeReview[]> {
  return api.get(
    `/api/v1/public/colleges/by-slug/${slug}/reviews?limit=${limit}`,
  );
}

export async function getCollegeAnnouncements(
  slug: string,
): Promise<PublicSiteAnnouncement[]> {
  return api.get(`/api/v1/public/colleges/by-slug/${slug}/announcements`);
}

export async function getInstitutionsAcrossWorldSection(
  collegeId: string,
): Promise<PublicCollegeSectionResponse<PublicInstitutionsAcrossWorldSection>> {
  return api.get(
    `/api/v1/public/colleges/${collegeId}/section/institutions_across_world`,
  );
}

export async function getCommuteSection(
  collegeId: string,
): Promise<PublicCollegeSectionResponse<PublicCommuteSection>> {
  return api.get(`/api/v1/public/colleges/${collegeId}/section/commute`);
}

export async function getHappeningsSection(
  collegeId: string,
): Promise<PublicCollegeSectionResponse<PublicHappeningsSection>> {
  return api.get(`/api/v1/public/colleges/${collegeId}/section/happenings`);
}

export async function getCodeOfConductSection(
  collegeId: string,
): Promise<PublicCollegeSectionResponse<PublicCodeOfConductSection>> {
  return api.get(
    `/api/v1/public/colleges/${collegeId}/section/student_code_of_conduct`,
  );
}

export async function getCampusAmbassadors(
  collegeId: string,
): Promise<AmbassadorOption[]> {
  return api.get(`/api/v1/public/colleges/${collegeId}/ambassadors`);
}
