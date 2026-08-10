import { z } from "zod";

const TICKET_STATUSES = [
  "in_progress",
  "awaiting_response",
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

export const createTicketSchema = z.object({
  college_id: z.string().trim().min(1, "college_id is required"),
  subject: z.string().trim().min(1, "Subject is required").max(255),
  description: z.string().trim().min(1, "Description is required").max(2000),
  attachments: z.array(attachmentSchema).max(5).optional(),
});

export const sendMessageSchema = z
  .object({
    message: z.string().trim().max(2000).optional(),
    attachments: z.array(attachmentSchema).max(5).optional(),
  })
  .refine(
    (data) => !!data.message?.trim() || (data.attachments?.length ?? 0) > 0,
    { message: "Message or at least one attachment is required" },
  );

export const listTicketsQuerySchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(TICKET_STATUSES),
});
