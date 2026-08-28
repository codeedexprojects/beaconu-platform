import { z } from "zod";

export const GALLERY_MEDIA_TYPES = ["image", "video"] as const;

export const createGalleryItemSchema = z.object({
  mediaType: z.enum(GALLERY_MEDIA_TYPES).default("image"),
  url: z.string().trim().url("Enter a valid media URL"),
  caption: z.string().trim().max(255).optional().nullable(),
});

export type CreateGalleryItemInput = z.infer<typeof createGalleryItemSchema>;

export const reorderGallerySchema = z.object({
  orderedIds: z.array(z.string().trim().min(1)).min(1),
});

export type ReorderGalleryInput = z.infer<typeof reorderGallerySchema>;
