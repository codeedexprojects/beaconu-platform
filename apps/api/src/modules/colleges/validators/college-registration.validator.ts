import { z } from "zod";

export const COURSE_CREATE_TAB_IDS = [
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

const courseCreateTabsSchema = z
  .array(z.string().trim().min(1))
  .min(1, "At least one course tab is required")
  .refine(
    (tabs) => tabs.every((tab) => COURSE_CREATE_TAB_IDS.includes(tab as any)),
    {
      message: `Invalid tab in tabs. Valid values: ${COURSE_CREATE_TAB_IDS.join(", ")}`,
    },
  )
  .transform((tabs) => Array.from(new Set(tabs)));

const courseCreateTabDataSchema = z
  .object({
    course_info: z.unknown().optional(),
    admission_policy: z.unknown().optional(),
    placements: z.unknown().optional(),
    fees: z.unknown().optional(),
    financial_aid: z.unknown().optional(),
    student_housing: z.unknown().optional(),
    exam_policy: z.unknown().optional(),
    faculty: z.unknown().optional(),
    review: z.unknown().optional(),
    library: z.unknown().optional(),
    clubs_associations: z.unknown().optional(),
    alliance: z.unknown().optional(),
    other_courses_offered: z.unknown().optional(),
    demo_graphics: z.unknown().optional(),
  })
  .partial();

// ── College Profile ──────────────────────────────────────────────────────────
export const updateCollegeProfileSchema = z.object({
  name: z.string().trim().min(2).max(255).optional(),
  code: z.string().trim().min(2).max(20).optional(),
  universityId: z.string().optional(),
  domain: z.string().trim().max(255).optional().nullable(),
  logoUrl: z.string().url().or(z.literal("")).optional().nullable(),
  coverImageUrl: z.string().url().or(z.literal("")).optional().nullable(),
  address: z.string().trim().optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  district: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  pinCode: z.string().trim().max(10).optional().nullable(),
  requestedGroupCode: z.string().trim().max(30).optional().nullable(),
  profileSections: z.record(z.string(), z.unknown()).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export const setSubdomainSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, {
      message:
        "Subdomain can only contain lowercase letters, numbers, and hyphens",
    }),
});

// ── Campus ───────────────────────────────────────────────────────────────────
export const createCampusSchema = z.object({
  name: z.string().trim().min(2).max(255),
  address: z.string().trim().optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  pinCode: z.string().trim().max(10).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  isMainCampus: z.boolean().default(false),
});

export const updateCampusSchema = createCampusSchema.partial();

// ── Course ───────────────────────────────────────────────────────────────────
export const createCourseSchema = z.object({
  name: z.string().trim().min(2).max(255),
  code: z.string().trim().min(1).max(30),
  disciplineId: z.string(),
  studyLevelId: z.string(),
  programTypeId: z.string(),
  campusId: z.string().optional().nullable(),
  duration: z.string().trim().max(50).optional().nullable(),
  eligibility: z.string().trim().optional().nullable(),
  intakeCapacity: z.number().int().positive().optional().nullable(),
  studyMode: z.enum(["full_time", "part_time", "online"]).default("full_time"),
  tabs: courseCreateTabsSchema.optional(),
  tabData: courseCreateTabDataSchema.optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

// ── Exported types ───────────────────────────────────────────────────────────
export type UpdateCollegeProfileData = z.infer<
  typeof updateCollegeProfileSchema
>;
export type SetSubdomainData = z.infer<typeof setSubdomainSchema>;
export type CreateCampusData = z.infer<typeof createCampusSchema>;
export type UpdateCampusData = z.infer<typeof updateCampusSchema>;
export type CreateCourseData = z.infer<typeof createCourseSchema>;
export type UpdateCourseData = z.infer<typeof updateCourseSchema>;
