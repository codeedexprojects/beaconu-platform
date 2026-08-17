import { z } from "zod";

export const compareCollegeParamSchema = z.object({
  collegeId: z.string().trim().min(1),
});

export const compareCourseParamSchema = z.object({
  collegeId: z.string().trim().min(1),
  courseId: z.string().trim().min(1),
});

export const heroQuerySchema = z.object({
  course_id: z.string().trim().min(1).optional(),
});

export const eligibilityQuerySchema = z.object({
  student_type: z.enum(["indian", "foreign"]).optional(),
  quota_category: z.string().trim().min(1).optional(),
});
