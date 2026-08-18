import { z } from "zod";

const offlinePaymentBaseSchema = z
  .object({
    payment_method: z.enum(["demand_draft", "bank_transfer"]),
    amount: z.coerce.number().positive("Amount must be a positive number"),
    proof_url: z.string().trim().min(1, "Proof upload is required"),
    proof_file_name: z.string().trim().nullable().optional(),
    dd_number: z.string().trim().nullable().optional(),
    dd_bank_name: z.string().trim().nullable().optional(),
    dd_date: z.coerce.date().nullable().optional(),
    bank_ref_number: z.string().trim().nullable().optional(),
    note: z.string().trim().nullable().optional(),
  })
  .refine(
    (data) =>
      data.payment_method !== "demand_draft" || !!data.dd_number?.length,
    { message: "DD number is required", path: ["dd_number"] },
  )
  .refine(
    (data) =>
      data.payment_method !== "demand_draft" || !!data.dd_bank_name?.length,
    { message: "DD bank name is required", path: ["dd_bank_name"] },
  )
  .refine((data) => data.payment_method !== "demand_draft" || !!data.dd_date, {
    message: "DD date is required",
    path: ["dd_date"],
  })
  .refine(
    (data) =>
      data.payment_method !== "bank_transfer" || !!data.bank_ref_number?.length,
    { message: "Bank reference number is required", path: ["bank_ref_number"] },
  );

export const submitOfflineTokenPaymentSchema = offlinePaymentBaseSchema;
export type SubmitOfflineTokenPaymentInput = z.infer<
  typeof submitOfflineTokenPaymentSchema
>;

export const resubmitOfflineTokenPaymentSchema = offlinePaymentBaseSchema;
export type ResubmitOfflineTokenPaymentInput = z.infer<
  typeof resubmitOfflineTokenPaymentSchema
>;

export const reviewOfflineTokenPaymentSchema = z
  .object({
    decision: z.enum(["verified", "rejected"]),
    note: z.string().trim().nullable().optional(),
    received_amount: z.coerce.number().positive().nullable().optional(),
  })
  .refine((data) => data.decision !== "rejected" || !!data.note?.length, {
    message: "A note is required when rejecting",
    path: ["note"],
  })
  .refine(
    (data) =>
      data.decision !== "verified" || data.received_amount !== undefined,
    {
      message: "The received amount is required when marking as received",
      path: ["received_amount"],
    },
  );
export type ReviewOfflineTokenPaymentInput = z.infer<
  typeof reviewOfflineTokenPaymentSchema
>;

export const listOfflineReviewQueueQuerySchema = z.object({
  status: z.enum(["pending_verification", "verified", "rejected"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ListOfflineReviewQueueQuery = z.infer<
  typeof listOfflineReviewQueueQuerySchema
>;
