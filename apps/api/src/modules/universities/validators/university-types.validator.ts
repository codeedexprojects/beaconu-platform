import { z } from "zod";
import {
  createUniversityTypeSchema,
  updateUniversityTypeSchema,
} from "@beaconu/validation";

// Query strings send booleans as "true"/"false" strings — transform them for this route only.
const optionalBooleanFromQuery = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) =>
    typeof value === "boolean" ? value : value === "true",
  );

export const universityTypeSchemas = {
  idParam: z.object({
    id: z.string().uuid(),
  }),
  listQuery: z.object({
    is_active: optionalBooleanFromQuery.optional(),
  }),
  create: createUniversityTypeSchema,
  update: updateUniversityTypeSchema.refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field is required" },
  ),
};

// Backend services receive Zod-parsed data — defaults are already filled in, use output types.
export type CreateUniversityTypeInput = z.output<
  typeof createUniversityTypeSchema
>;
export type UpdateUniversityTypeInput = z.output<
  typeof updateUniversityTypeSchema
>;
export type ListUniversityTypesQuery = z.output<
  typeof universityTypeSchemas.listQuery
>;
