import { z } from "zod";

const EXAM_LEVELS = ["national", "state", "university"] as const;

const createEntranceExamSchema = z.object({
  name: z.string().trim().min(1).max(255),
  code: z.string().trim().min(1).max(20).toUpperCase(),
  conducting_body: z.string().trim().max(255).optional(),
  exam_level: z.enum(EXAM_LEVELS),
  applicable_courses: z.array(z.string().trim().max(100)).max(20).default([]),
  eligibility: z.string().trim().optional(),
  description: z.string().trim().optional(),
  registration_start: z.string().date().optional(),
  registration_end: z.string().date().optional(),
  exam_date: z.string().date().optional(),
  result_date: z.string().date().optional(),
  official_website: z.string().url().optional(),
});

const updateEntranceExamSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  code: z.string().trim().min(1).max(20).toUpperCase().optional(),
  conducting_body: z.string().trim().max(255).optional(),
  exam_level: z.enum(EXAM_LEVELS).optional(),
  applicable_courses: z.array(z.string().trim().max(100)).max(20).optional(),
  eligibility: z.string().trim().optional(),
  description: z.string().trim().optional(),
  registration_start: z.string().date().nullable().optional(),
  registration_end: z.string().date().nullable().optional(),
  exam_date: z.string().date().nullable().optional(),
  result_date: z.string().date().nullable().optional(),
  official_website: z.string().url().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

const listEntranceExamsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  status: z.enum(["active", "inactive"]).optional(),
  exam_level: z.enum(EXAM_LEVELS).optional(),
  search: z.string().optional(),
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const entranceExamSchemas = {
  create: createEntranceExamSchema,
  update: updateEntranceExamSchema,
  listQuery: listEntranceExamsQuerySchema,
  idParam: idParamSchema,
};

export type CreateEntranceExamInput = z.infer<typeof createEntranceExamSchema>;
export type UpdateEntranceExamInput = z.infer<typeof updateEntranceExamSchema>;
export type ListEntranceExamsQuery = z.infer<
  typeof listEntranceExamsQuerySchema
>;
