import { z } from "zod";

// ── Direction A: college requests a document FROM a student ──────────────
// College admin creates the request (type + deadline), student submits a
// file, college admin verifies/rejects it.

export const documentCategoryValues = [
  "academic",
  "identification",
  "financial",
  "medical",
  "administrative",
  "other",
] as const;

export const createSubmissionRequestSchema = z.object({
  student_id: z.string().trim().min(1, "Student is required"),
  document_category: z.enum(documentCategoryValues, {
    message: "A valid document category is required",
  }),
  document_name: z.string().trim().min(1, "Document name is required").max(255),
  instructions: z.string().trim().max(1000).optional(),
  deadline: z.string().date("Valid date is required (YYYY-MM-DD)"),
});

export const submitDocumentSchema = z.object({
  file_url: z.string().trim().url("A valid file URL is required"),
  file_name: z.string().trim().max(255).optional(),
  file_size_bytes: z.coerce.number().int().positive().optional(),
});

export const reviewSubmissionSchema = z
  .object({
    status: z.enum(["verified", "rejected"]),
    rejection_reason: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.status !== "rejected" || !!data.rejection_reason, {
    message: "Rejection reason is required when rejecting a document",
    path: ["rejection_reason"],
  });

export const submissionRequestListQuerySchema = z.object({
  status: z
    .enum(["pending", "under_review", "verified", "rejected"])
    .optional(),
  student_id: z.string().trim().optional(),
  search: z.string().trim().max(255).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateSubmissionRequestInput = z.infer<
  typeof createSubmissionRequestSchema
>;
export type SubmitDocumentInput = z.infer<typeof submitDocumentSchema>;
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
export type SubmissionRequestListQuery = z.infer<
  typeof submissionRequestListQuerySchema
>;

// ── Direction B: student requests an official document FROM the college ──
// Student creates the request (e.g. bonafide certificate), college admin
// issues (uploads) it or rejects it.

export const supportingDocumentSchema = z.object({
  url: z.string().trim().url("A valid file URL is required"),
  name: z.string().trim().max(255).optional(),
  size_bytes: z.coerce.number().int().positive().optional(),
});

export const createDocumentRequestSchema = z
  .object({
    college_id: z.string().trim().min(1, "College is required"),
    document_template_id: z.string().trim().optional(),
    document_name: z.string().trim().max(255).optional(),
    description: z.string().trim().max(1000).optional(),
    delivery_mode: z.enum(["digital", "pickup", "courier"]),
    supporting_documents: z.array(supportingDocumentSchema).max(5).optional(),
  })
  .refine((data) => !!data.document_template_id || !!data.document_name, {
    message: "Either document_template_id or document_name is required",
    path: ["document_name"],
  });

export const issueDocumentRequestSchema = z.object({
  document_url: z.string().trim().url("A valid document URL is required"),
  file_name: z.string().trim().max(255).optional(),
  file_size_bytes: z.coerce.number().int().positive().optional(),
  pickup_instructions: z.string().trim().max(1000).optional(),
  office_contact_phone: z.string().trim().max(20).optional(),
});

export const rejectDocumentRequestSchema = z.object({
  rejection_reason: z
    .string()
    .trim()
    .min(1, "Rejection reason is required")
    .max(500),
});

export const resubmitDocumentRequestSchema = z.object({
  document_name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(1000).optional(),
  delivery_mode: z.enum(["digital", "pickup", "courier"]).optional(),
});

export const documentRequestListQuerySchema = z.object({
  status: z
    .enum([
      "submitted",
      "processing",
      "awaiting_approval",
      "rejected",
      "issued",
      "collected",
    ])
    .optional(),
  student_id: z.string().trim().optional(),
  search: z.string().trim().max(255).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type SupportingDocumentInput = z.infer<typeof supportingDocumentSchema>;
export type CreateDocumentRequestInput = z.infer<
  typeof createDocumentRequestSchema
>;
export type IssueDocumentRequestInput = z.infer<
  typeof issueDocumentRequestSchema
>;
export type RejectDocumentRequestInput = z.infer<
  typeof rejectDocumentRequestSchema
>;
export type ResubmitDocumentRequestInput = z.infer<
  typeof resubmitDocumentRequestSchema
>;
export type DocumentRequestListQuery = z.infer<
  typeof documentRequestListQuerySchema
>;

// ── Document templates: catalog of documents students can request ────────
// College admin defines what's requestable (e.g. "Bonafide Certificate",
// "Transcript"); the student app lists these to build the request form.

export const createDocumentTemplateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  category: z.enum(documentCategoryValues, {
    message: "A valid document category is required",
  }),
  instructions: z.string().trim().max(1000).optional(),
  description: z.string().trim().max(1000).optional(),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export const updateDocumentTemplateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  category: z.enum(documentCategoryValues).optional(),
  instructions: z.string().trim().max(1000).optional(),
  description: z.string().trim().max(1000).optional(),
  sort_order: z.coerce.number().int().min(0).optional(),
});

export const templateListQuerySchema = z.object({
  include_inactive: z.coerce.boolean().default(false),
});

export const studentTemplateListQuerySchema = z.object({
  college_id: z.string().trim().min(1, "College is required"),
});

export type CreateDocumentTemplateInput = z.infer<
  typeof createDocumentTemplateSchema
>;
export type UpdateDocumentTemplateInput = z.infer<
  typeof updateDocumentTemplateSchema
>;
export type TemplateListQuery = z.infer<typeof templateListQuerySchema>;
export type StudentTemplateListQuery = z.infer<
  typeof studentTemplateListQuerySchema
>;
