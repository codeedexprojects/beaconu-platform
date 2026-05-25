import { z } from "zod";

const optionalUrlSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const universityGovernanceMemberSchema = z.object({
  userPhotoUrl: optionalUrlSchema,
  name: z.string().max(255).optional(),
  designation: z.string().max(255).optional(),
  description: z.string().optional(),
});

const universityGovernanceSchema = z.object({
  academic_council: z.array(universityGovernanceMemberSchema).optional(),
  management_council: z.array(universityGovernanceMemberSchema).optional(),
  organizational_organogram: z
    .object({
      title: z.string().max(255).optional(),
      fileUrl: optionalUrlSchema,
      description: z.string().optional(),
    })
    .optional(),
});

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
  cover_url: optionalUrlSchema,
  logo_url: optionalUrlSchema,
  governance: universityGovernanceSchema.optional(),
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
