import type {
  PublicAdmissionExamsAccepted,
  PublicCollegeOverviewAmenity,
  PublicCollegeOverviewBadge,
  PublicCollegeOverviewFacility,
  PublicCollegeOverviewLocation,
  PublicCollegeOverviewStat,
  PublicCourseClassTimings,
  PublicCourseCurriculum,
  PublicCourseFlexibleExitOptions,
  PublicCourseKeyDates,
  PublicCourseStructure,
  PublicCourseValueAddedCourses,
  PublicFeesTab,
  PublicGalleryItem,
} from "./colleges";

export interface CompareHero {
  collegeId: string;
  name: string;
  slug: string;
  coverImageUrl: string | null;
  logoUrl: string | null;
  avgRating: number;
  reviewCount: number;
  establishedYear: number | null;
  ownershipType: string | null;
  city: string | null;
  state: string | null;
  courseId: string | null;
  courseName: string | null;
}

export interface CompareCampusDetails {
  campusSizeAcres: string | null;
  amenities: PublicCollegeOverviewAmenity[];
  insideCampusFacilities: PublicCollegeOverviewFacility[];
  location: PublicCollegeOverviewLocation | null;
  view360Url: string | null;
}

export interface CompareAffiliateCollege {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface CompareAccreditationAffiliation {
  universityName: string | null;
  universityType: string | null;
  accreditation: string | null;
  institutionGroupName: string | null;
  affiliatedColleges: CompareAffiliateCollege[];
  courseAccreditations: unknown;
}

export interface CompareUniversityDetails {
  universityDetails: PublicCollegeOverviewStat[];
  accolades: PublicCollegeOverviewBadge[];
}

export interface CompareCourseDetails {
  courseId: string;
  courseName: string;
  duration: string | null;
  studyMode: string | null;
  highlights: unknown;
  courseStructure: PublicCourseStructure | null;
  careerOpportunities: unknown;
  industryTools: unknown;
  labFacilities: unknown;
  roomFacilities: unknown;
}

export interface CompareEligibilityCriteria {
  student_types: { value: string; label: string }[];
  quotas: { id: string; label: string }[];
  criteria: { heading: string; description: string }[];
  filters_applied: {
    student_type: "indian" | "foreign" | null;
    quota_category: string | null;
  };
}

export interface CompareEntranceExams {
  entranceExamsAccepted: PublicAdmissionExamsAccepted | null;
  keyDates: PublicCourseKeyDates | null;
}

export interface CompareCurriculum {
  curriculum: PublicCourseCurriculum | null;
  courseStructure: PublicCourseStructure | null;
}

export interface CompareValueAdded {
  valueAddedCourses: PublicCourseValueAddedCourses | null;
  flexibleExitOptions: PublicCourseFlexibleExitOptions | null;
  classTimings: PublicCourseClassTimings | null;
}

export type CompareFees = PublicFeesTab;

export type ComparePlacements = unknown;

export interface CompareStudentLife {
  gallery: PublicGalleryItem[];
  clubs: unknown[];
  reviewsSummary: { avgRating: number; reviewCount: number };
}

export type CompareHousing = unknown;
