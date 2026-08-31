import { z } from "zod";

export const startApplicationSchema = z.object({
  nationality: z.string().trim().min(1, "Nationality is required").max(100),
  course_id: z.string().trim().min(1, "Course is required"),
  campus_id: z.string().trim().optional().nullable(),
  state_of_domicile: z.string().trim().max(100).optional().nullable(),
  passport_country: z.string().trim().max(100).optional().nullable(),
  passport_number: z.string().trim().max(50).optional().nullable(),
});

export const applicationCycleParamSchema = z.object({
  id: z.string().min(1, "Application form ID is required"),
});

export const getFormDetailsQuerySchema = z.object({
  section: z.enum([
    "personal_details",
    "family_details",
    "address_details",
    "qualification_details",
    "achievements_details",
    "tenth_grade",
    "twelfth_grade",
    "undergraduate",
    "pg",
    "diploma",
    "entrance_exam_details",
    "declaration",
  ]),
});

export const getStatusAllCyclesQuerySchema = z.object({
  college_id: z.string().trim().min(1).optional(),
});

export const getStatusQuerySchema = z.object({
  application_id: z.string().trim().min(1).optional(),
});

export const listApplicationsQuerySchema = z.object({
  admission_cycle_id: z.string().trim().min(1).optional(),
  form_status: z.string().trim().min(1).optional(),
  fee_payment_status: z.string().trim().min(1).optional(),
  course_id: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const listPendingEnrollmentQuerySchema = z.object({
  admission_cycle_id: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const rejectApplicationCourseSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});

export type StartApplicationInput = z.infer<typeof startApplicationSchema>;
export type GetFormDetailsQuery = z.infer<typeof getFormDetailsQuerySchema>;
export type GetStatusAllCyclesQuery = z.infer<
  typeof getStatusAllCyclesQuerySchema
>;
export type GetStatusQuery = z.infer<typeof getStatusQuerySchema>;
export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;
export type ListPendingEnrollmentQuery = z.infer<
  typeof listPendingEnrollmentQuerySchema
>;
