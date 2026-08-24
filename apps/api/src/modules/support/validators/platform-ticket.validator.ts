import { z } from "zod";

const PLATFORM_TICKET_STATUSES = [
  "in_progress",
  "awaiting_response",
  "resolved",
  "closed",
  "reopened",
] as const;

const MANUAL_PLATFORM_TICKET_STATUSES = [
  "resolved",
  "closed",
  "reopened",
] as const;

const attachmentSchema = z.object({
  url: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  fileType: z.string().trim().min(1),
  fileSize: z.number().int().positive().optional(),
});

export const createPlatformTicketSchema = z.object({
  type: z.enum(["query", "call_request"]).default("query"),
  subject: z.string().trim().min(1, "Subject is required").max(255),
  description: z.string().trim().min(1, "Description is required").max(2000),
  phone_number: z.string().trim().min(5).max(20).optional(),
  preferred_time: z.string().trim().max(100).optional(),
  attachments: z.array(attachmentSchema).max(5).optional(),
});

export const sendPlatformTicketMessageSchema = z
  .object({
    message: z.string().trim().max(2000).optional(),
    attachments: z.array(attachmentSchema).max(5).optional(),
  })
  .refine(
    (data) => !!data.message?.trim() || (data.attachments?.length ?? 0) > 0,
    { message: "Message or at least one attachment is required" },
  );

export const listPlatformTicketsQuerySchema = z.object({
  status: z.enum(PLATFORM_TICKET_STATUSES).optional(),
  type: z.enum(["query", "call_request"]).optional(),
  college_id: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updatePlatformTicketStatusSchema = z.object({
  status: z.enum(MANUAL_PLATFORM_TICKET_STATUSES),
});

// page omitted -> the query resolves the last (most recent) page itself.
export const getPlatformTicketQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
