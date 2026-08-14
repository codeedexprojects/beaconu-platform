import { z } from "zod";

const GRADES = ["10th", "12th"] as const;

const optionalBooleanFromQuery = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) =>
    typeof value === "boolean" ? value : value === "true",
  );

const subjectSchema = z
  .object({
    course: z.string().trim().max(100).optional(),
    name: z.string().trim().min(1, "Subject name is required").max(100),
    max_mark: z.number().positive("Max mark must be greater than 0"),
    pass_mark: z.number().min(0, "Pass mark cannot be negative"),
  })
  .refine((data) => data.pass_mark <= data.max_mark, {
    message: "Pass mark cannot exceed max mark",
    path: ["pass_mark"],
  });

export function validateSubjectsMatchGrade(
  grade: (typeof GRADES)[number],
  subjects: { course?: string }[],
) {
  if (grade === "12th") {
    return subjects.every((s) => !!s.course?.trim());
  }
  return subjects.every((s) => !s.course?.trim());
}

const createEducationBoardSchema = z
  .object({
    name: z.string().trim().min(1, "Board name is required").max(150),
    grade: z.enum(GRADES),
    subjects: z.array(subjectSchema).min(1, "At least one subject is required"),
  })
  .refine((data) => validateSubjectsMatchGrade(data.grade, data.subjects), {
    message:
      "12th-grade subjects each need a course/stream; 10th-grade subjects must not have one",
    path: ["subjects"],
  });

const updateEducationBoardSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    grade: z.enum(GRADES).optional(),
    is_active: z.boolean().optional(),
    subjects: z.array(subjectSchema).min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const listEducationBoardsQuerySchema = z.object({
  grade: z.enum(GRADES).optional(),
  is_active: optionalBooleanFromQuery.optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

const idParamSchema = z.object({
  id: z.string(),
});

const listEducationBoardNamesQuerySchema = z.object({
  grade: z.enum(GRADES).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// GET /:id?course= — course only matters for 12th-grade boards (each of
// which has multiple streams/courses under it); 10th-grade boards have a
// single flat subject list and ignore this param entirely.
const boardDetailQuerySchema = z.object({
  course: z.string().trim().optional(),
});

export const educationBoardSchemas = {
  create: createEducationBoardSchema,
  update: updateEducationBoardSchema,
  listQuery: listEducationBoardsQuerySchema,
  idParam: idParamSchema,
  listNamesQuery: listEducationBoardNamesQuerySchema,
  detailQuery: boardDetailQuerySchema,
};

export type CreateEducationBoardInput = z.infer<
  typeof createEducationBoardSchema
>;
export type UpdateEducationBoardInput = z.infer<
  typeof updateEducationBoardSchema
>;
export type ListEducationBoardsQuery = z.infer<
  typeof listEducationBoardsQuerySchema
>;
export type ListEducationBoardNamesQuery = z.infer<
  typeof listEducationBoardNamesQuerySchema
>;
