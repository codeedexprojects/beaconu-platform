import { z } from "zod";

export const walletTransactionQuerySchema = z.object({
  type: z.enum(["credit", "debit"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type WalletTransactionQuery = z.infer<
  typeof walletTransactionQuerySchema
>;

export const referralCodeParamSchema = z.object({
  code: z.string().trim().min(1, "code is required").max(30),
});

/** `referrer` is the raw Play Install Referrer query string; `code` is a deep
 * link or manual entry. Parsing server-side keeps the format app-agnostic. */
export const resolveInviteSchema = z
  .object({
    code: z.string().trim().max(30).optional(),
    referrer: z.string().trim().max(1000).optional(),
  })
  .refine((d) => Boolean(d.code || d.referrer), {
    message: "Provide either code or referrer",
  });

export type ResolveInviteInput = z.infer<typeof resolveInviteSchema>;
