import { z } from "zod";

const optionalUuidFromQuery = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(z.string().optional());

const sectionIdentifierParam = z
  .string()
  .trim()
  .min(1, "section identifier is required");

export const publicCollegeSchemas = {
  filtersQuery: z.object({
    search: z.string().trim().optional(),
  }),

  collegeIdParam: z.object({
    collegeId: z.string(),
  }),

  sectionParam: z.object({
    collegeId: z.string(),
    sectionName: sectionIdentifierParam,
  }),

  listQuery: z.object({
    universityId: optionalUuidFromQuery,
    streamId: optionalUuidFromQuery,
    disciplineId: optionalUuidFromQuery,
    studyLevelId: optionalUuidFromQuery,
    programTypeId: optionalUuidFromQuery,
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
  }),

  summaryQuery: z.object({
    universityId: optionalUuidFromQuery,
    streamId: optionalUuidFromQuery,
    disciplineId: optionalUuidFromQuery,
    studyLevelId: optionalUuidFromQuery,
    programTypeId: optionalUuidFromQuery,
  }),
};

export type PublicCollegeSummaryQuery = z.output<
  typeof publicCollegeSchemas.summaryQuery
>;

export type PublicCollegeListQuery = z.output<
  typeof publicCollegeSchemas.listQuery
>;
