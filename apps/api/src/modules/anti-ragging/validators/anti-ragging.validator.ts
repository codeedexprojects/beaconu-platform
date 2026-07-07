import { z } from "zod";

export const incidentTypeValues = [
  "verbal",
  "physical",
  "mental",
  "cyber",
] as const;

export const individualInvolvedSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  department: z.string().trim().max(100).optional(),
  year: z.string().trim().max(20).optional(),
  class: z.string().trim().max(50).optional(),
});

export const evidenceAttachmentSchema = z.object({
  url: z.string().trim().url("A valid file URL is required"),
  name: z.string().trim().max(255).optional(),
  size_bytes: z.coerce.number().int().positive().optional(),
});

export const createComplaintSchema = z.object({
  college_id: z.string().trim().min(1, "College is required"),
  incident_type: z.enum(incidentTypeValues, {
    message: "A valid incident type is required",
  }),
  subject: z.string().trim().min(1, "Subject is required").max(255),
  individuals_involved: z
    .array(individualInvolvedSchema)
    .min(1, "At least one individual must be listed")
    .max(20),
  incident_date: z.string().date("Valid date is required (YYYY-MM-DD)"),
  incident_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Valid time is required (HH:MM)")
    .optional(),
  description: z.string().trim().min(1, "Description is required").max(5000),
  attachments: z.array(evidenceAttachmentSchema).max(10).optional(),
});

export const complaintListQuerySchema = z.object({
  status: z
    .enum(["submitted", "acknowledged", "investigating", "resolved"])
    .optional(),
  incident_type: z.enum(incidentTypeValues).optional(),
  search: z.string().trim().max(255).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const acknowledgeComplaintSchema = z.object({});

export const startInvestigationSchema = z.object({});

export const resolveComplaintSchema = z.object({
  resolution: z
    .string()
    .trim()
    .min(1, "Resolution details are required")
    .max(5000),
});

export type IndividualInvolvedInput = z.infer<typeof individualInvolvedSchema>;
export type EvidenceAttachmentInput = z.infer<typeof evidenceAttachmentSchema>;
export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type ComplaintListQuery = z.infer<typeof complaintListQuerySchema>;
export type ResolveComplaintInput = z.infer<typeof resolveComplaintSchema>;
