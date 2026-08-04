import { z } from "zod";

export const universityTypeSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_-]+$/)
  .max(50);

export const createUniversityTypeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: universityTypeSlugSchema,
  sort_order: z.number().int().min(0).optional().default(0),
  is_active: z.boolean().optional().default(true),
});

export const updateUniversityTypeSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  slug: universityTypeSlugSchema.optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export const listUniversityTypesQuerySchema = z.object({
  is_active: z.boolean().optional(),
});

export type CreateUniversityTypeInput = z.input<
  typeof createUniversityTypeSchema
>;
export type UpdateUniversityTypeInput = z.input<
  typeof updateUniversityTypeSchema
>;
export type ListUniversityTypesQuery = z.input<
  typeof listUniversityTypesQuerySchema
>;
