import { z } from "zod";

const genderEnum = z.enum(["male", "female", "other", "prefer_not_to_say"]);
const categoryEnum = z.enum(["general", "obc", "sc", "st", "ews", "other"]);

const updateProfileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .max(255, "Full name must be at most 255 characters")
    .optional(),

  email: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .pipe(z.string().email("Invalid email address").nullable())
    .optional()
    .nullable(),

  avatar_url: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .pipe(z.string().url("Invalid URL").nullable())
    .optional()
    .nullable(),

  date_of_birth: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "date_of_birth must be an ISO date string (YYYY-MM-DD)",
    )
    .optional()
    .nullable(),

  gender: genderEnum.optional().nullable(),

  city: z
    .string()
    .trim()
    .max(100, "City must be at most 100 characters")
    .optional()
    .nullable(),

  state: z
    .string()
    .trim()
    .max(100, "State must be at most 100 characters")
    .optional()
    .nullable(),

  nationality: z
    .string()
    .trim()
    .max(100, "Nationality must be at most 100 characters")
    .optional()
    .nullable(),

  category: categoryEnum.optional().nullable(),
});

const STUDENT_STATUSES = ["active", "suspended", "inactive"] as const;

const listStudentsQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  status: z.enum(STUDENT_STATUSES).optional(),
  source: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const updateStudentStatusSchema = z.object({
  status: z.enum(STUDENT_STATUSES),
});

const collegeStudentListQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  status: z
    .enum([
      "active",
      "on_leave",
      "suspended",
      "completed",
      "withdrawn",
      "course_switched",
    ])
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const studentSchemas = {
  updateProfile: updateProfileSchema,
  listStudentsQuery: listStudentsQuerySchema,
  updateStudentStatus: updateStudentStatusSchema,
  collegeStudentListQuery: collegeStudentListQuerySchema,
};

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ListStudentsQueryInput = z.infer<typeof listStudentsQuerySchema>;
export type UpdateStudentStatusInput = z.infer<
  typeof updateStudentStatusSchema
>;
