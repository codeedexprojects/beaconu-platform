import { z } from "zod";

export const createUniversitySchema = z.object({
  university_type_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  accreditation: z.string().max(255).optional(),
  governance_details: z.string().optional(),
  logo_url: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateUniversitySchema = createUniversitySchema.partial();

export const listUniversitiesQuerySchema = z.object({
  status: z.enum(["active", "inactive", "archived"]).optional(),
  university_type_id: z.string().uuid().optional(),
  state: z.string().optional(),
  search: z.string().optional(),
});

export type CreateUniversityInput = z.infer<typeof createUniversitySchema>;
export type UpdateUniversityInput = z.infer<typeof updateUniversitySchema>;
export type ListUniversitiesQuery = z.infer<typeof listUniversitiesQuerySchema>;
