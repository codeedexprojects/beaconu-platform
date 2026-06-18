import { z } from "zod";
import { knownLanguagesSchema } from "./shared";

const bankDetailsSchema = z.object({
  account_holder_name: z
    .string()
    .trim()
    .min(1, "Account holder name is required"),
  account_number: z
    .string()
    .regex(/^\d{9,18}$/, "Account number must be 9–18 digits"),
  ifsc: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code (e.g. SBIN0001234)"),
  bank_name: z.string().trim().min(1, "Bank name is required"),
});

export const updateMyProfileSchema = z.object({
  full_name: z.string().trim().min(1).optional(),
  phone_number: z.string().trim().optional(),
  avatar_url: z.string().url().optional(),
  counsellor_type: z.string().trim().optional(),
  known_languages: knownLanguagesSchema.optional(),
  session_fee: z.coerce.number().min(0).optional(),
  about: z.string().trim().max(2000).optional(),
  expertise: z.array(z.string().trim().min(1)).optional(),
  education: z.array(z.string().trim().min(1)).optional(),
  upi_id: z
    .string()
    .trim()
    .regex(/^[\w.-]{2,256}@[a-zA-Z]{2,64}$/, "Invalid UPI ID (e.g. name@bank)")
    .optional(),
  bank_details: bankDetailsSchema.optional(),
});

export const updateCounsellorStatusSchema = z.object({
  status: z.enum(["active", "inactive", "pending_verification"]),
});

export type UpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>;
export type UpdateCounsellorStatusInput = z.infer<
  typeof updateCounsellorStatusSchema
>;
