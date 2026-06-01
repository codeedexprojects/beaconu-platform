import { z } from "zod";

export const createStarterGuideVideoSchema = z.object({
  title: z.string().trim().min(1).max(255),
  video_key: z.string().trim().min(1),
  display_order: z.number().int().min(0).default(0),
});

export const updateStarterGuideVideoSchema = createStarterGuideVideoSchema
  .partial()
  .extend({
    is_active: z.boolean().optional(),
  });

export type CreateStarterGuideVideoInput = z.infer<
  typeof createStarterGuideVideoSchema
>;
export type UpdateStarterGuideVideoInput = z.infer<
  typeof updateStarterGuideVideoSchema
>;
