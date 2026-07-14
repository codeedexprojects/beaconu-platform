import { z } from "zod";

export const attachCourseQuotaSchema = z.object({
  college_quota_id: z.string().min(1, "college_quota_id is required"),
  total_seats: z.number().int().min(0),
});

export type AttachCourseQuotaInput = z.infer<typeof attachCourseQuotaSchema>;

export const updateCourseQuotaSeatsSchema = z.object({
  total_seats: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export type UpdateCourseQuotaSeatsInput = z.infer<
  typeof updateCourseQuotaSeatsSchema
>;
