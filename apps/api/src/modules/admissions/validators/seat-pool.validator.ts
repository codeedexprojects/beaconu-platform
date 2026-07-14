import { z } from "zod";

export const createSeatPoolSchema = z.object({
  college_quota_id: z.string().min(1, "college_quota_id is required"),
  total_seats: z.number().int().min(0),
  course_ids: z
    .array(z.string().min(1))
    .min(1, "Select at least one course to share this seat pool"),
});

export type CreateSeatPoolInput = z.infer<typeof createSeatPoolSchema>;

export const updateSeatPoolSchema = z.object({
  total_seats: z.number().int().min(0).optional(),
  course_ids: z.array(z.string().min(1)).min(1).optional(),
  is_active: z.boolean().optional(),
});

export type UpdateSeatPoolInput = z.infer<typeof updateSeatPoolSchema>;
