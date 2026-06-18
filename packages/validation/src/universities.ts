import { z } from "zod";

function isAcceptableUrl(value: string): boolean {
  if (value.startsWith("/")) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const optionalUrlSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().refine(isAcceptableUrl, "Expected a valid http(s) URL or a relative path").optional());

const universityGovernanceMemberSchema = z.object({
  userPhotoUrl: optionalUrlSchema,
  name: z.string().max(255).optional(),
  designation: z.string().max(255).optional(),
  description: z.string().optional(),
});

const universityGovernanceCouncilSchema = z.union([
  z.array(universityGovernanceMemberSchema),
  z.object({
    description: z.string().optional(),
    members: z.array(universityGovernanceMemberSchema).optional(),
  }),
]);

const universityGovernanceSchema = z.object({
  academic_council: universityGovernanceCouncilSchema.optional(),
  management_council: universityGovernanceCouncilSchema.optional(),
  organizational_organogram: z
    .object({
      title: z.string().max(255).optional(),
      fileUrl: optionalUrlSchema,
      description: z.string().optional(),
    })
    .optional(),
});

export const createUniversitySchema = z.object({
  university_type_id: z.string(),
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
  university_type_id: z.string().optional(),
  state: z.string().optional(),
  search: z.string().optional(),
});

export type CreateUniversityInput = z.infer<typeof createUniversitySchema>;
export type UpdateUniversityInput = z.infer<typeof updateUniversitySchema>;
export type ListUniversitiesQuery = z.infer<typeof listUniversitiesQuerySchema>;
