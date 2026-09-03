import { z } from "zod";

const youtubeUrlSchema = z
  .string()
  .trim()
  .url("Enter a valid video URL")
  .refine(
    (url) => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url),
    "Enter a valid YouTube video URL",
  );

const createFeedSchema = z.object({
  caption: z.string().trim().min(1, "Caption is required").max(2000),
  thumbnail_url: z.string().trim().url("Enter a valid thumbnail URL"),
  video_url: youtubeUrlSchema,
  display_order: z.number().int().min(0).default(0),
});

const updateFeedSchema = z
  .object({
    caption: z.string().trim().min(1).max(2000).optional(),
    thumbnail_url: z
      .string()
      .trim()
      .url("Enter a valid thumbnail URL")
      .optional(),
    video_url: youtubeUrlSchema.optional(),
    display_order: z.number().int().min(0).optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const listFeedQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  is_active: z.coerce.boolean().optional(),
});

const idParamSchema = z.object({ id: z.string() });

export const feedSchemas = {
  create: createFeedSchema,
  update: updateFeedSchema,
  listQuery: listFeedQuerySchema,
  idParam: idParamSchema,
};

export type CreateFeedInput = z.infer<typeof createFeedSchema>;
export type UpdateFeedInput = z.infer<typeof updateFeedSchema>;
export type ListFeedQuery = z.infer<typeof listFeedQuerySchema>;
