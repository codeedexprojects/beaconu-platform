import { z } from "zod";

export const requestSeatCancellationSchema = z.object({
  application_course_id: z
    .string()
    .trim()
    .min(1, "application_course_id is required"),
  reason: z.string().trim().min(1, "Reason is required").max(1000),
  supporting_doc_urls: z.array(z.string().trim().url()).max(5).optional(),
});

export const reviewSeatCancellationSchema = z
  .object({
    decision: z.enum(["approve", "reject"]),
    remarks: z.string().trim().max(1000).optional(),
    refund_amount: z.number().nonnegative().optional(),
    refund_status: z
      .enum(["not_applicable", "pending", "processed", "denied"])
      .optional(),
  })
  .refine((data) => data.decision !== "reject" || !!data.remarks, {
    message: "Remarks are required when rejecting a request",
    path: ["remarks"],
  });

export const listSeatCancellationsQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type RequestSeatCancellationInput = z.infer<
  typeof requestSeatCancellationSchema
>;
export type ReviewSeatCancellationInput = z.infer<
  typeof reviewSeatCancellationSchema
>;
export type ListSeatCancellationsQuery = z.infer<
  typeof listSeatCancellationsQuerySchema
>;
