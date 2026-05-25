import { z } from "zod";

const createNewsAlertSchema = z.object({
  title: z.string().trim().min(1).max(255),
  summary: z.string().trim().max(500).optional(),
  content: z.string().trim().min(1),
  cover_image_url: z.string().url().optional(),
  tags: z.array(z.string().trim().max(50)).max(10).default([]),
  source: z.string().trim().max(500).optional(),
  college_id: z.string().uuid().optional(),
});

const updateNewsAlertSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  summary: z.string().trim().max(500).optional(),
  content: z.string().trim().min(1).optional(),
  cover_image_url: z.string().url().optional(),
  tags: z.array(z.string().trim().max(50)).max(10).optional(),
  source: z.string().trim().max(500).optional(),
});

const listNewsAlertsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  status: z.enum(["draft", "published", "archived"]).optional(),
  search: z.string().optional(),
});

const publicListNewsAlertsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  search: z.string().optional(),
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const slugParamSchema = z.object({
  slug: z.string().min(1),
});

export const newsAlertSchemas = {
  create: createNewsAlertSchema,
  update: updateNewsAlertSchema,
  listQuery: listNewsAlertsQuerySchema,
  publicListQuery: publicListNewsAlertsQuerySchema,
  idParam: idParamSchema,
  slugParam: slugParamSchema,
};

export type CreateNewsAlertInput = z.infer<typeof createNewsAlertSchema>;
export type UpdateNewsAlertInput = z.infer<typeof updateNewsAlertSchema>;
export type ListNewsAlertsQuery = z.infer<typeof listNewsAlertsQuerySchema>;
export type PublicListNewsAlertsQuery = z.infer<
  typeof publicListNewsAlertsQuerySchema
>;
