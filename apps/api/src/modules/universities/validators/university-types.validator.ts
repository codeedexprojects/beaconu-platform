import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_-]+$/)
  .max(50);

const optionalBooleanFromQuery = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) => (typeof value === "boolean" ? value : value === "true"));

export const universityTypeSchemas = {
  idParam: z.object({
    id: z.string().uuid(),
  }),
  listQuery: z.object({
    is_active: optionalBooleanFromQuery.optional(),
  }),
  create: z.object({
    name: z.string().trim().min(1).max(100),
    slug: slugSchema,
    sort_order: z.number().int().min(0).optional().default(0),
    is_active: z.boolean().optional().default(true),
  }),
  update: z
    .object({
      name: z.string().trim().min(1).max(100).optional(),
      slug: slugSchema.optional(),
      sort_order: z.number().int().min(0).optional(),
      is_active: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required",
    }),
};

export type CreateUniversityTypeInput = z.infer<typeof universityTypeSchemas.create>;
export type UpdateUniversityTypeInput = z.infer<typeof universityTypeSchemas.update>;
export type ListUniversityTypesQuery = z.infer<typeof universityTypeSchemas.listQuery>;
