import { z } from "zod";

export const updateMyProfileSchema = z.object({
  full_name: z.string().trim().min(1).optional(),
  phone_number: z.string().trim().optional(),
  avatar_url: z.string().url().optional(),
  counsellor_type: z.string().trim().optional(),
  known_languages: z.string().trim().optional(),
  session_fee: z.coerce.number().min(0).optional(),
});

export const updateCounsellorStatusSchema = z.object({
  status: z.enum(["active", "inactive", "pending_verification"]),
});

export type UpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>;
export type UpdateCounsellorStatusInput = z.infer<
  typeof updateCounsellorStatusSchema
>;
