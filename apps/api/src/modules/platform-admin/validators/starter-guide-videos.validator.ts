import { z } from "zod";

const createStarterGuideVideoSchema = z.object({
  title: z.string().trim().min(1).max(255),
  video_key: z.string().trim().min(1),
  display_order: z.number().int().min(0).default(0),
});

const updateStarterGuideVideoSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  video_key: z.string().trim().min(1).optional(),
  display_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

const listStarterGuideVideosQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  is_active: z.coerce.boolean().optional(),
});

const presignBodySchema = z.object({
  mime_type: z.enum(["video/mp4", "video/webm"]),
  file_size_bytes: z
    .number()
    .int()
    .positive()
    .max(500 * 1024 * 1024),
});

const idParamSchema = z.object({ id: z.string() });

export const starterGuideVideoSchemas = {
  create: createStarterGuideVideoSchema,
  update: updateStarterGuideVideoSchema,
  listQuery: listStarterGuideVideosQuerySchema,
  presignBody: presignBodySchema,
  idParam: idParamSchema,
};

export type CreateStarterGuideVideoInput = z.infer<
  typeof createStarterGuideVideoSchema
>;
export type UpdateStarterGuideVideoInput = z.infer<
  typeof updateStarterGuideVideoSchema
>;
export type ListStarterGuideVideosQuery = z.infer<
  typeof listStarterGuideVideosQuerySchema
>;
