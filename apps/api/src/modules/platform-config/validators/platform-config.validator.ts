import { z } from "zod";

export const updatePlatformConfigSchema = z
  .object({
    meetingGstPercentage: z
      .number()
      .min(0, "meetingGstPercentage must be ≥ 0")
      .max(100, "meetingGstPercentage must be ≤ 100")
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
