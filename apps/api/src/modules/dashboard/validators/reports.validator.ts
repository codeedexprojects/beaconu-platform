import { z } from "zod";

export const reportsQuerySchema = z.object({
  admission_cycle_id: z.string().trim().min(1).optional(),
});

export type ReportsQueryInput = z.infer<typeof reportsQuerySchema>;
