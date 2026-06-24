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

    // Accept common typo variant while normalizing to canonical option.
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

  listQuery: z.object({
    universityId: optionalUuidFromQuery,
    streamId: optionalUuidFromQuery,
    disciplineId: optionalUuidFromQuery,
    studyLevelId: optionalUuidFromQuery,
    programTypeId: optionalUuidFromQuery,
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
};

export type PublicCollegeListQuery = z.output<
  typeof publicCollegeSchemas.listQuery
>;
