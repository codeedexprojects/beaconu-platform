import { z } from "zod";

export const TOKEN_PAYMENT_STAGES = [
  "before_assessment",
  "after_shortlisting",
] as const;

export const attachAdmissionCycleCourseSchema = z.object({
  course_id: z.string().min(1, "course_id is required"),
  application_fee: z.number().min(0).default(0),
  interview_required: z.boolean().default(true),
  assessment_required: z.boolean().default(true),
  token_payment_stage: z.enum(TOKEN_PAYMENT_STAGES).optional().nullable(),
  token_amount: z.number().min(0).optional().nullable(),
  work_experience_required: z.boolean().default(true),
});

export type AttachAdmissionCycleCourseInput = z.infer<
  typeof attachAdmissionCycleCourseSchema
>;

export const updateAdmissionCycleCourseSchema = z.object({
  application_fee: z.number().min(0).optional(),
  interview_required: z.boolean().optional(),
  assessment_required: z.boolean().optional(),
  token_payment_stage: z.enum(TOKEN_PAYMENT_STAGES).optional().nullable(),
  token_amount: z.number().min(0).optional().nullable(),
  work_experience_required: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateAdmissionCycleCourseInput = z.infer<
  typeof updateAdmissionCycleCourseSchema
>;
