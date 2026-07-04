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

export const createDocumentRequestSchema = z.object({
  college_id: z.string().trim().min(1, "College is required"),
  document_name: z.string().trim().min(1, "Document name is required").max(255),
  description: z.string().trim().max(1000).optional(),
  delivery_mode: z.enum(["digital", "pickup", "courier"]),
});

export const issueDocumentRequestSchema = z.object({
  document_url: z.string().trim().url("A valid document URL is required"),
  file_name: z.string().trim().max(255).optional(),
  file_size_bytes: z.coerce.number().int().positive().optional(),
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
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

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
