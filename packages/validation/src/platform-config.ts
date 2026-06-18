import { z } from "zod";

export const updatePlatformConfigSchema = z
  .object({
    meetingGstPercentage: z.coerce.number().min(0).max(100).optional(),
    counsellorMinWithdrawalAmount: z.coerce.number().positive().optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });

export type UpdatePlatformConfigInput = z.input<
  typeof updatePlatformConfigSchema
>;
