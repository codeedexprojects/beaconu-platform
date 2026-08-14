import { z } from "zod";

const friendSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  study_level_id: z.string().trim().min(1, "Course is required"),
  discipline_id: z.string().trim().min(1, "Program/Major is required"),
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
