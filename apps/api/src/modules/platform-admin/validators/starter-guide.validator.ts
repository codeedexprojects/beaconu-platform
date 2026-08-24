import { z } from "zod";

const YOUTUBE_URL_REGEX =
  /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)/;

const stepSchema = z.object({
  title: z.string().trim().min(1, "Step title is required").max(200),
  description: z
    .string()
    .trim()
    .min(1, "Step description is required")
    .max(2000),
});

const createStarterGuideSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().trim().max(2000).optional(),
  thumbnail_url: z.string().trim().url("Enter a valid thumbnail URL"),
  video_url: z
    .string()
    .trim()
    .url("Enter a valid video URL")
    .regex(YOUTUBE_URL_REGEX, "Must be a YouTube video link"),
  steps: z.array(stepSchema).min(1, "At least one step is required"),
  display_order: z.number().int().min(0).default(0),
});

const updateStarterGuideSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().max(2000).optional(),
    thumbnail_url: z
      .string()
      .trim()
      .url("Enter a valid thumbnail URL")
      .optional(),
    video_url: z
      .string()
      .trim()
      .url("Enter a valid video URL")
      .regex(YOUTUBE_URL_REGEX, "Must be a YouTube video link")
      .optional(),
    steps: z
      .array(stepSchema)
      .min(1, "At least one step is required")
      .optional(),
    display_order: z.number().int().min(0).optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const listStarterGuidesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  is_active: z.coerce.boolean().optional(),
});

const idParamSchema = z.object({ id: z.string() });

export const starterGuideSchemas = {
  create: createStarterGuideSchema,
  update: updateStarterGuideSchema,
  listQuery: listStarterGuidesQuerySchema,
  idParam: idParamSchema,
};

export type CreateStarterGuideInput = z.infer<typeof createStarterGuideSchema>;
export type UpdateStarterGuideInput = z.infer<typeof updateStarterGuideSchema>;
export type ListStarterGuidesQuery = z.infer<
  typeof listStarterGuidesQuerySchema
>;
