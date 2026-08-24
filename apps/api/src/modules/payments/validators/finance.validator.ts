import { z } from "zod";

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
  .optional();

export const financeOverviewQuerySchema = z.object({
  from_date: dateOnly,
  to_date: dateOnly,
});
export type FinanceOverviewQueryInput = z.infer<
  typeof financeOverviewQuerySchema
>;

export const financeTransactionsQuerySchema = z.object({
  from_date: dateOnly,
  to_date: dateOnly,
  course_id: z.string().trim().min(1).optional(),
  fee_category: z.string().trim().min(1).optional(),
  payment_method: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type FinanceTransactionsQueryInput = z.infer<
  typeof financeTransactionsQuerySchema
>;

export const financeTransactionsExportQuerySchema =
  financeTransactionsQuerySchema.omit({ page: true, limit: true });
export type FinanceTransactionsExportQueryInput = z.infer<
  typeof financeTransactionsExportQuerySchema
>;
