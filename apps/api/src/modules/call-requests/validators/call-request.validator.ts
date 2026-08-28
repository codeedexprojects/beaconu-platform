import { z } from "zod";

const CALL_REQUEST_STATUSES = ["pending", "contacted", "cancelled"] as const;

export const createCallRequestSchema = z.object({
  college_id: z.string().trim().min(1, "college_id is required"),
  phone_number: z.string().trim().min(5).max(20).optional(),
  preferred_time: z.string().trim().max(100).optional(),
  message: z.string().trim().max(1000).optional(),
});

export const listCallRequestsQuerySchema = z.object({
  status: z.enum(CALL_REQUEST_STATUSES).optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updateCallRequestStatusSchema = z.object({
  status: z.enum(["contacted", "cancelled"]),
  staff_note: z.string().trim().max(1000).optional(),
});
