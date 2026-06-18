import { z } from "zod";

export const updatePlatformConfigSchema = z
  .object({
    gstPercentage: z
      .number()
      .min(0, "gstPercentage must be ≥ 0")
      .max(100, "gstPercentage must be ≤ 100")
      .optional(),
    counsellorMinWithdrawalAmount: z
      .number()
      .positive("counsellorMinWithdrawalAmount must be greater than zero")
      .optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });

export type UpdatePlatformConfigInput = z.infer<
  typeof updatePlatformConfigSchema
>;
