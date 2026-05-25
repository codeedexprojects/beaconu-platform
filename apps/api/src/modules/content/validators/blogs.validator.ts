import { z } from "zod";

const submitBlogSchema = z.object({
  title: z.string().trim().min(1).max(255),
  summary: z.string().trim().max(500).optional(),
  content: z.string().trim().min(1),
  cover_image_url: z.string().url().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

const updateBlogSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  summary: z.string().trim().max(500).optional(),
  content: z.string().trim().min(1).optional(),
  cover_image_url: z.string().url().optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

const rejectBlogSchema = z.object({
  rejection_reason: z.string().trim().min(1).max(1000),
});

const listBlogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  search: z.string().optional(),
});

const publicListBlogsQuerySchema = z.object({
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

export const blogSchemas = {
  submit: submitBlogSchema,
  update: updateBlogSchema,
  reject: rejectBlogSchema,
  listQuery: listBlogsQuerySchema,
  publicListQuery: publicListBlogsQuerySchema,
  idParam: idParamSchema,
  slugParam: slugParamSchema,
};

export type SubmitBlogInput = z.infer<typeof submitBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type RejectBlogInput = z.infer<typeof rejectBlogSchema>;
export type ListBlogsQuery = z.infer<typeof listBlogsQuerySchema>;
export type PublicListBlogsQuery = z.infer<typeof publicListBlogsQuerySchema>;
