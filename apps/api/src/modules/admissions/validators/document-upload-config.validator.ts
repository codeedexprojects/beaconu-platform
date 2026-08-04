import { z } from "zod";
import { IMAGE_MIME_TYPES } from "@/modules/upload/upload.constants";

export const DOCUMENT_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  "application/pdf",
] as const;

const acceptedMimeTypesSchema = z
  .array(z.enum(DOCUMENT_MIME_TYPES as unknown as [string, ...string[]]))
  .min(1, "Select at least one accepted file type");

export const createDocumentRequirementSchema = z.object({
  document_category: z
    .string()
    .trim()
    .min(1, "document_category is required")
    .max(30),
  document_label: z
    .string()
    .trim()
    .min(1, "document_label is required")
    .max(100),
  is_required: z.boolean().default(true),
  applies_to_nationalities: z.array(z.string().trim().min(1)).optional(),
  accepted_mime_types: acceptedMimeTypesSchema.optional(),
  sort_order: z.number().int().min(0).optional(),
  course_ids: z.array(z.string().min(1)).optional().default([]),
  quota_ids: z.array(z.string().min(1)).optional().default([]),
});

export type CreateDocumentRequirementInput = z.infer<
  typeof createDocumentRequirementSchema
>;

export const updateDocumentRequirementSchema = z.object({
  document_category: z.string().trim().min(1).max(30).optional(),
  document_label: z.string().trim().min(1).max(100).optional(),
  is_required: z.boolean().optional(),
  applies_to_nationalities: z
    .array(z.string().trim().min(1))
    .optional()
    .nullable(),
  accepted_mime_types: acceptedMimeTypesSchema.optional().nullable(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  course_ids: z.array(z.string().min(1)).optional(),
  quota_ids: z.array(z.string().min(1)).optional(),
});

export type UpdateDocumentRequirementInput = z.infer<
  typeof updateDocumentRequirementSchema
>;
