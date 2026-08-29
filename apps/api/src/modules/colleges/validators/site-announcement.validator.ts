import { z } from "zod";

export const createSiteAnnouncementSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  date: z.coerce.date(),
  link: z.string().trim().url().or(z.literal("")).optional().nullable(),
  highlighted: z.boolean().optional(),
});

export const updateSiteAnnouncementSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  date: z.coerce.date().optional(),
  link: z.string().trim().url().or(z.literal("")).optional().nullable(),
  highlighted: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const reorderSiteAnnouncementsSchema = z.object({
  orderedIds: z.array(z.string().trim().min(1)).min(1),
});

export type CreateSiteAnnouncementBody = z.infer<
  typeof createSiteAnnouncementSchema
>;
export type UpdateSiteAnnouncementBody = z.infer<
  typeof updateSiteAnnouncementSchema
>;
export type ReorderSiteAnnouncementsBody = z.infer<
  typeof reorderSiteAnnouncementsSchema
>;
