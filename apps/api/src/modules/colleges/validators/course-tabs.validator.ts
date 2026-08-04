import { z } from "zod";

export const COURSE_SETUP_TAB_IDS = [
  "course_info",
  "admission_policy",
  "placements",
  "fees",
  "financial_aid",
  "student_housing",
  "exam_policy",
  "faculty",
  "review",
  "library",
  "clubs_associations",
  "alliance",
  "other_courses_offered",
  "demo_graphics",
] as const;

export const TAB_FIELD_MAP: Record<string, string> = {
  highlights: "highlights",
  curriculum: "curriculum",
  course_structure: "courseStructure",
  value_added_courses: "valueAddedCourses",
  career_opportunities: "careerOpportunities",
  higher_education_certifications: "higherEducationCertifications",
  flexible_exit_options: "flexibleExitOptions",
  class_timings: "classTimings",
  industry_tools: "industryTools",
  lab_facilities: "labFacilities",
  room_facilities: "roomFacilities",
  featured_alumni: "featuredAlumni",
  faqs: "faqs",
  exam_policy: "examPolicy",
  entrance_exam_eligibility: "entranceExamEligibility",
  eligibility_criteria: "eligibilityCriteria",
  accreditations: "accreditations",
  key_dates: "keyDates",
  demographics: "demographics",
} as const;

export const VALID_TAB_NAMES = [
  ...Object.keys(TAB_FIELD_MAP),
  ...COURSE_SETUP_TAB_IDS,
];

export const courseTabParamSchema = z.object({
  id: z.string().min(1, "Course ID is required"),
  tabName: z
    .string()
    .min(1)
    .refine((val) => VALID_TAB_NAMES.includes(val), {
      message: `Invalid tab name. Valid tabs: ${VALID_TAB_NAMES.join(", ")}`,
    }),
});

export const courseIdParamSchema = z.object({
  id: z.string().min(1, "Course ID is required"),
});

export const publicCourseTabParamSchema = z.object({
  slug: z.string().min(1, "College slug is required"),
  courseId: z.string().min(1, "Course ID is required"),
  tabName: z
    .string()
    .min(1)
    .refine((val) => VALID_TAB_NAMES.includes(val), {
      message: `Invalid tab name. Valid tabs: ${VALID_TAB_NAMES.join(", ")}`,
    }),
});

export const publicCourseDetailParamSchema = z.object({
  slug: z.string().min(1, "College slug is required"),
  courseId: z.string().min(1, "Course ID is required"),
});

export const eligibilityCriteriaQuerySchema = z.object({
  student_type: z.enum(["indian", "foreign"]).optional(),
  quota_category: z.string().trim().optional(),
});

export const scholarshipDetailsQuerySchema = z.object({
  port_entry_id: z.string().trim().optional(),
  score_range_id: z.string().trim().optional(),
});

export const reviewsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
  per_page: z
    .string()
    .optional()
    .transform((v) => (v ? Math.min(50, Math.max(1, parseInt(v, 10))) : 10)),
});

export const otherCoursesOfferedQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
  per_page: z
    .string()
    .optional()
    .transform((v) => (v ? Math.min(50, Math.max(1, parseInt(v, 10))) : 10)),
  search: z.string().trim().optional(),
});

export const clubsAssociationsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
  per_page: z
    .string()
    .optional()
    .transform((v) => (v ? Math.min(50, Math.max(1, parseInt(v, 10))) : 10)),
  search: z.string().trim().optional(),
});

export const clubDetailParamSchema = z.object({
  slug: z.string().min(1, "College slug is required"),
  courseId: z.string().min(1, "Course ID is required"),
  clubId: z.string().min(1, "Club ID is required"),
});

// ── Update Body Schema ───────────────────────────────────────────────────────

export const updateCourseTabSchema = z.object({
  data: z.unknown(),
});

// ── Exported Types ───────────────────────────────────────────────────────────

export type CourseTabParam = z.infer<typeof courseTabParamSchema>;
export type CourseIdParam = z.infer<typeof courseIdParamSchema>;
export type PublicCourseTabParam = z.infer<typeof publicCourseTabParamSchema>;
export type PublicCourseDetailParam = z.infer<
  typeof publicCourseDetailParamSchema
>;
export type UpdateCourseTabData = z.infer<typeof updateCourseTabSchema>;
export type EligibilityCriteriaQuery = z.infer<
  typeof eligibilityCriteriaQuerySchema
>;
export type ScholarshipDetailsQuery = z.infer<
  typeof scholarshipDetailsQuerySchema
>;
export type OtherCoursesOfferedQuery = z.infer<
  typeof otherCoursesOfferedQuerySchema
>;
export type ClubsAssociationsQuery = z.infer<
  typeof clubsAssociationsQuerySchema
>;
export type ClubDetailParam = z.infer<typeof clubDetailParamSchema>;
