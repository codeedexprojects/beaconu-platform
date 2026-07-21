import { z } from "zod";

export const confirmPaymentSchema = z.object({
  transaction_id: z.string().trim().min(1, "Transaction id is required"),
  provider_payment_id: z
    .string()
    .trim()
    .min(1, "Provider payment id is required"),
  provider_signature: z.string().trim().optional(),
});

export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
