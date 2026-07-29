import { z } from "zod";

export const createAdmissionCycleSchema = z
  .object({
    application_type: z
      .string()
      .trim()
      .min(1, "Application type is required")
      .max(50),
    name: z.string().trim().min(1, "Application name is required").max(255),
    admission_year: z
      .string()
      .trim()
      .min(1, "Admission year is required")
      .max(10),
    program_level: z
      .string()
      .trim()
      .min(1, "Program level is required")
      .max(30),
    starts_on: z.coerce.date(),
    ends_on: z.coerce.date().optional(),
    // Whether the whole application form requires an assessment — the
    // single source of truth AttemptService.start() gates on.
    assessment_required: z.boolean().optional(),
    // One assessment template for the whole application form — every
    // course under this cycle shares it. Optional/nullable — a cycle can
    // have no assessment configured.
    assessment_template_id: z.string().trim().min(1).optional().nullable(),
  })
  .refine((data) => !data.ends_on || data.ends_on >= data.starts_on, {
    message: "End date must be on or after the start date",
    path: ["ends_on"],
  });

export const updateAdmissionCycleSchema = z
  .object({
    application_type: z.string().trim().min(1).max(50).optional(),
    name: z.string().trim().min(1).max(255).optional(),
    admission_year: z.string().trim().min(1).max(10).optional(),
    program_level: z.string().trim().min(1).max(30).optional(),
    starts_on: z.coerce.date().optional(),
    ends_on: z.coerce.date().optional(),
    assessment_required: z.boolean().optional(),
    assessment_template_id: z.string().trim().min(1).optional().nullable(),
  })
  .refine(
    (data) =>
      !data.ends_on || !data.starts_on || data.ends_on >= data.starts_on,
    {
      message: "End date must be on or after the start date",
      path: ["ends_on"],
    },
  );

export const admissionCycleListQuerySchema = z.object({
  application_type: z.string().trim().optional(),
  program_level: z.string().trim().optional(),
  admission_year: z.string().trim().optional(),
});

// college_id is optional — omitting it (e.g. the client hitting this
// endpoint with no cycle/college context yet) lists open cycles across
// every college instead of scoping to one. course_id is also optional —
// narrows to cycles that actually have that course attached (active
// AdmissionCycleCourse), for a "find where I can apply for this course"
// search.
export const studentAdmissionCycleListQuerySchema =
  admissionCycleListQuerySchema.extend({
    college_id: z.string().trim().min(1).optional(),
    course_id: z.string().trim().min(1).optional(),
  });

export type CreateAdmissionCycleInput = z.infer<
  typeof createAdmissionCycleSchema
>;
export type UpdateAdmissionCycleInput = z.infer<
  typeof updateAdmissionCycleSchema
>;
export type AdmissionCycleListQuery = z.infer<
  typeof admissionCycleListQuerySchema
>;
export type StudentAdmissionCycleListQuery = z.infer<
  typeof studentAdmissionCycleListQuerySchema
>;
