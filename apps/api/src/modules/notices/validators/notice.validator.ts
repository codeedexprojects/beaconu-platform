import { z } from "zod";

const attachmentSchema = z.object({
  url: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  fileType: z.string().trim().min(1),
  fileSize: z.number().int().positive().optional(),
});

export const createNoticeSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  content: z.string().trim().min(1, "Content is required").max(5000),
  category: z.string().trim().min(1).max(30).optional(),
  is_pinned: z.boolean().optional(),
  required_documents: z.array(z.string().trim().min(1)).max(20).optional(),
  attachments: z.array(attachmentSchema).max(10).optional(),
});

export const updateNoticeSchema = createNoticeSchema.partial();

export const listNoticesQuerySchema = z.object({
  status: z.enum(["published", "archived"]).optional(),
  category: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const studentNoticesQuerySchema = listNoticesQuerySchema.extend({
  college_id: z.string().trim().min(1, "college_id is required"),
});

export const studentNoticeParamsQuerySchema = z.object({
  college_id: z.string().trim().min(1, "college_id is required"),
});
