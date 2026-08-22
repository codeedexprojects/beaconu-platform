import { z } from "zod";

const starterGuideStepSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),
});

export const createStarterGuideSchema = z.object({
  title: z.string().trim().min(1).max(255),
  thumbnail_url: z.string().trim().url(),
  video_url: z.string().trim().url(),
  steps: z.array(starterGuideStepSchema).min(1),
  display_order: z.number().int().min(0).default(0),
});

export const updateStarterGuideSchema = createStarterGuideSchema
  .partial()
  .extend({
    is_active: z.boolean().optional(),
  });

export type CreateStarterGuideInput = z.infer<typeof createStarterGuideSchema>;
export type UpdateStarterGuideInput = z.infer<typeof updateStarterGuideSchema>;
