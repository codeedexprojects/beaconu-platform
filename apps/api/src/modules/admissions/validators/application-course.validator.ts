import { z } from "zod";

export const addApplicationCourseSchema = z.object({
  course_id: z.string().min(1, "Course is required"),
  course_quota_seat_id: z.string().trim().min(1).optional().nullable(),
  preference_order: z.number().int().min(1).max(10).optional(),
});

export type AddApplicationCourseInput = z.infer<
  typeof addApplicationCourseSchema
>;
