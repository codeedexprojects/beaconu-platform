import { z } from "zod";

export const collegeIdQuerySchema = z.object({
  college_id: z.string().trim().min(1, "college_id is required"),
});

export const hostelIdParamSchema = z.object({
  hostelId: z.string().trim().min(1, "hostelId is required"),
});

export type CollegeIdQuery = z.infer<typeof collegeIdQuerySchema>;
