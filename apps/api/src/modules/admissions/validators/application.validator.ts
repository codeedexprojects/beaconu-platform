import { z } from "zod";

export const startApplicationSchema = z.object({
  nationality: z.string().trim().min(1, "Nationality is required").max(100),
  campus_id: z.string().trim().optional().nullable(),
  state_of_domicile: z.string().trim().max(100).optional().nullable(),
  passport_country: z.string().trim().max(100).optional().nullable(),
  passport_number: z.string().trim().max(50).optional().nullable(),
});

export const applicationCycleParamSchema = z.object({
  id: z.string().min(1, "Application form ID is required"),
});

export type StartApplicationInput = z.infer<typeof startApplicationSchema>;
