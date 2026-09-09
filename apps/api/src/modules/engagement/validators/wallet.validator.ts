import { z } from "zod";

export const createBankAccountSchema = z.object({
  bankName: z.string().trim().min(1, "Bank name is required").max(100),
  accountHolderName: z
    .string()
    .trim()
    .min(1, "Account holder name is required")
    .max(255),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{9,18}$/, "Account number must be 9–18 digits"),
  ifscCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code (e.g. SBIN0001234)"),
  accountType: z.enum(["savings", "current"]).default("savings"),
  isPrimary: z.boolean().default(false),
});

export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;

export const requestRedemptionSchema = z.object({
  amount: z
    .number({ error: "Amount must be a number" })
    .positive("Amount must be greater than zero"),
  bankAccountId: z.string().trim().min(1, "bankAccountId is required"),
});

export type RequestRedemptionInput = z.infer<typeof requestRedemptionSchema>;

export const listRedemptionsQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListRedemptionsQuery = z.infer<typeof listRedemptionsQuerySchema>;

export const reviewRedemptionSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  remarks: z.string().trim().max(500).optional(),
});

export type ReviewRedemptionInput = z.infer<typeof reviewRedemptionSchema>;
