import { z } from "zod";

const optionalUrlSchema = z
  .string()
  .trim()
  .url()
  .or(z.literal(""))
  .optional()
  .nullable();

export const createScholarshipConfigSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  scholarship_type: z.string().trim().min(1, "Type is required").max(30),
  discount_type: z.enum(["flat", "percentage"]),
  discount_value: z.coerce.number().positive("Must be greater than 0"),
  required_documents: z
    .array(z.string().trim().min(1))
    .min(1, "Add at least one required supporting document"),
  cover_image_url: optionalUrlSchema,
});

export const updateScholarshipConfigSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  scholarship_type: z.string().trim().min(1).max(30).optional(),
  discount_type: z.enum(["flat", "percentage"]).optional(),
  discount_value: z.coerce.number().positive().optional(),
  required_documents: z
    .array(z.string().trim().min(1))
    .min(1, "Add at least one required supporting document")
    .optional(),
  is_active: z.boolean().optional(),
  cover_image_url: optionalUrlSchema,
});

export const listScholarshipConfigsQuerySchema = z.object({
  college_id: z.string().trim().min(1).optional(),
  active_only: z.coerce.boolean().optional(),
});

const supportingDocumentSchema = z.object({
  documentName: z.string().trim().min(1),
  fileUrl: z.string().trim().url(),
});

export const applyScholarshipSchema = z.object({
  scholarship_config_id: z.string().trim().min(1),
  application_id: z.string().trim().min(1),
  reason: z.string().trim().min(1, "Reason is required").max(2000),
  annual_family_income_range: z
    .string()
    .trim()
    .min(1, "Annual family income range is required")
    .max(50),
  supporting_documents: z.array(supportingDocumentSchema).default([]),
});

export const reviewScholarshipApplicationSchema = z.object({
  action: z.enum(["approve", "reject"]),
  discount_amount: z.coerce.number().positive().optional(),
  review_remarks: z.string().trim().max(1000).optional(),
});

export const listScholarshipApplicationsQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export type CreateScholarshipConfigBody = z.infer<
  typeof createScholarshipConfigSchema
>;
export type UpdateScholarshipConfigBody = z.infer<
  typeof updateScholarshipConfigSchema
>;
export type ApplyScholarshipBody = z.infer<typeof applyScholarshipSchema>;
export type ReviewScholarshipApplicationBody = z.infer<
  typeof reviewScholarshipApplicationSchema
>;
