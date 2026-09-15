import { z } from "zod";

const optionalUuidFromQuery = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(z.string().optional());

const optionalListSortFromQuery = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;

    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

    if (normalized === "fees_low_to_heigh") return "fees_low_to_high";

    return normalized || undefined;
  },
  z.enum(["popularity", "fees_high_to_low", "fees_low_to_high"]).optional(),
);

const sectionIdentifierParam = z
  .string()
  .trim()
  .min(1, "section identifier is required");

export const publicCollegeSchemas = {
  sectionParam: z.object({
    collegeId: z.string(),
    sectionName: sectionIdentifierParam,
  }),

  courseOptionsQuery: z.object({
    universityId: optionalUuidFromQuery,
    streamId: optionalUuidFromQuery,
    disciplineId: optionalUuidFromQuery,
    studyLevelId: optionalUuidFromQuery,
    programTypeId: optionalUuidFromQuery,
    search: z
      .string()
      .trim()
      .max(100)
      .optional()
      .transform((v) => v || undefined),
    state: z
      .string()
      .trim()
      .optional()
      .transform((v) => v || undefined),
    district: z
      .string()
      .trim()
      .optional()
      .transform((v) => v || undefined),
    city: z
      .string()
      .trim()
      .optional()
      .transform((v) => v || undefined),
  }),

  locationOptionsQuery: z.object({
    universityId: optionalUuidFromQuery,
    streamId: optionalUuidFromQuery,
    disciplineId: optionalUuidFromQuery,
    studyLevelId: optionalUuidFromQuery,
    programTypeId: optionalUuidFromQuery,
    courseMasterId: optionalUuidFromQuery,
    courseName: z
      .string()
      .trim()
      .max(255)
      .optional()
      .transform((v) => v || undefined),
    state: z
      .string()
      .trim()
      .max(100)
      .optional()
      .transform((v) => v || undefined),
  }),

  listQuery: z.object({
    universityId: optionalUuidFromQuery,
    streamId: optionalUuidFromQuery,
    disciplineId: optionalUuidFromQuery,
    studyLevelId: optionalUuidFromQuery,
    programTypeId: optionalUuidFromQuery,
    courseMasterId: optionalUuidFromQuery,
    courseName: z
      .string()
      .trim()
      .max(255)
      .optional()
      .transform((v) => v || undefined),
    sortBy: optionalListSortFromQuery,
    sort: optionalListSortFromQuery,
    filter: optionalListSortFromQuery,
    state: z
      .string()
      .trim()
      .optional()
      .transform((v) => v || undefined),
    district: z
      .string()
      .trim()
      .optional()
      .transform((v) => v || undefined),
    city: z
      .string()
      .trim()
      .optional()
      .transform((v) => v || undefined),
  }),

  reviewsQuery: z.object({
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  }),

  coursesMinimalQuery: z.object({
    college_id: optionalUuidFromQuery,
  }),
};

export type PublicCollegeListQuery = z.output<
  typeof publicCollegeSchemas.listQuery
>;
