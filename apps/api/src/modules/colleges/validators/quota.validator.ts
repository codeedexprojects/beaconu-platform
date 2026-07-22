import { z } from "zod";

export const QUOTA_BUCKET_TYPES = ["in_state", "out_of_state"] as const;

export const createQuotaSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  bucketType: z.enum(QUOTA_BUCKET_TYPES),
  description: z.string().trim().max(2000).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

export type CreateQuotaInput = z.infer<typeof createQuotaSchema>;

export const updateQuotaSchema = createQuotaSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type UpdateQuotaInput = z.infer<typeof updateQuotaSchema>;

export const quotaIdParamSchema = z.object({
  id: z.string().min(1, "Quota ID is required"),
});

export const listQuotasQuerySchema = z.object({
  bucket_type: z.enum(QUOTA_BUCKET_TYPES).optional(),
  include_inactive: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

export type ListQuotasQuery = z.infer<typeof listQuotasQuerySchema>;
