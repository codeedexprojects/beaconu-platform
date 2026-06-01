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
