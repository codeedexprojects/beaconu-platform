import { z } from "zod";

export const requestRefundSchema = z.object({
  upi_id: z
    .string()
    .trim()
    .regex(/^[\w.-]{2,256}@[a-zA-Z]{2,64}$/, "Invalid UPI ID (e.g. name@bank)"),
  reason: z
    .string()
    .trim()
    .min(10, "Please provide a detailed reason")
    .max(2000),
  proof_url: z.string().url().optional(),
});
export type RequestRefundInput = z.infer<typeof requestRefundSchema>;

export const listMyRefundRequestsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListMyRefundRequestsQueryInput = z.infer<
  typeof listMyRefundRequestsQuerySchema
>;

export const listRefundRequestsQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListRefundRequestsQueryInput = z.infer<
  typeof listRefundRequestsQuerySchema
>;

export const updateRefundStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  remarks: z.string().max(500).optional(),
});
export type UpdateRefundStatusInput = z.infer<typeof updateRefundStatusSchema>;

export const refundRequestIdParamsSchema = z.object({
  id: z.string().min(1),
});
