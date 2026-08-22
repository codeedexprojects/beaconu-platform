import { z } from "zod";

const optionalBooleanFromQuery = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) =>
    typeof value === "boolean" ? value : value === "true",
  );

const createSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  icon_url: z.string().trim().url().optional().nullable(),
  colleges_count: z.number().int().min(0).optional(),
  sort_order: z.number().int().optional(),
});

const updateSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    icon_url: z.string().trim().url().optional().nullable(),
    colleges_count: z.number().int().min(0).optional(),
    sort_order: z.number().int().optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const listQuerySchema = z.object({
  is_active: optionalBooleanFromQuery.optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

const idParamSchema = z.object({
  id: z.string(),
});

export const instituteOfNationalImportanceSchemas = {
  create: createSchema,
  update: updateSchema,
  listQuery: listQuerySchema,
  idParam: idParamSchema,
};

export type CreateInstituteOfNationalImportanceInput = z.infer<
  typeof createSchema
>;
export type UpdateInstituteOfNationalImportanceInput = z.infer<
  typeof updateSchema
>;
export type ListInstitutesOfNationalImportanceQuery = z.infer<
  typeof listQuerySchema
>;
