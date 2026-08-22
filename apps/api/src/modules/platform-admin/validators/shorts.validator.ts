import { z } from "zod";

const createShortSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  thumbnail_url: z.string().trim().url("Enter a valid thumbnail URL"),
  video_url: z.string().trim().url("Enter a valid video URL"),
  display_order: z.number().int().min(0).default(0),
});

const updateShortSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    thumbnail_url: z
      .string()
      .trim()
      .url("Enter a valid thumbnail URL")
      .optional(),
    video_url: z.string().trim().url("Enter a valid video URL").optional(),
    display_order: z.number().int().min(0).optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const listShortsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  is_active: z.coerce.boolean().optional(),
});

const idParamSchema = z.object({ id: z.string() });

export const shortSchemas = {
  create: createShortSchema,
  update: updateShortSchema,
  listQuery: listShortsQuerySchema,
  idParam: idParamSchema,
};

export type CreateShortInput = z.infer<typeof createShortSchema>;
export type UpdateShortInput = z.infer<typeof updateShortSchema>;
export type ListShortsQuery = z.infer<typeof listShortsQuerySchema>;
