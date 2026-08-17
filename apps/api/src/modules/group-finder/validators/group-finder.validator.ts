import { z } from "zod";

const friendSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  // References a CourseMaster (platform course catalog) row, e.g. "B.Tech
  // Computer Science Engineering" — its Discipline (and, where set, Study
  // Level) is resolved server-side and used as the actual match criteria
  // against real per-college courses. Stream is derived from the course's
  // discipline, not taken as separate input.
  course_id: z.string().trim().min(1, "Course is required"),
});

export const matchGroupSchema = z.object({
  preferred_city: z.string().trim().max(100).optional(),
  preferred_state: z.string().trim().max(100).optional(),
  friends: z
    .array(friendSchema)
    .min(2, "At least 2 friends are required to find a group match")
    .max(6, "Up to 6 friends can be matched at a time"),
});

export type MatchGroupInput = z.infer<typeof matchGroupSchema>;

export const searchCoursesQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});
