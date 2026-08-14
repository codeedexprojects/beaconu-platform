import { z } from "zod";

// Shared "per-subject marks" row used identically on the 10th and 12th
// grade screens (Theory/Practical/Internal breakdown + attempts).
const subjectMarksSchema = z.object({
  subject_name: z.string().trim().min(1, "Subject name is required").max(100),
  evaluation_pattern: z.string().trim().max(50),
  theory_marks: z.number().min(0).optional().nullable(),
  practical_marks: z.number().min(0).optional().nullable(),
  internal_marks: z.number().min(0).optional().nullable(),
  max_marks: z.number().min(0),
  obtained_marks: z.number().min(0),
  attempts: z.number().int().min(1).optional().nullable(),
  percentage: z.number().min(0).max(100).optional().nullable(),
});

const markingSchemeSchema = z.enum(["percentage", "gpa", "other"]);

// Shared "overall result" block, same shape on both school-level screens.
const resultSummarySchema = z.object({
  marking_scheme: markingSchemeSchema,
  marks_obtained: z.number().min(0).optional().nullable(),
  max_marks: z.number().min(0).optional().nullable(),
  percentage: z.number().min(0).max(100).optional().nullable(),
  remarks: z.string().trim().max(500).optional().nullable(),
});

export const tenthGradeDetailsSchema = z.object({
  academic_year: z.string().trim().min(1, "Academic year is required").max(20),
  admission_year: z
    .string()
    .trim()
    .min(1, "Admission year is required")
    .max(20),
  year_of_passing: z.number().int().min(1950).max(2100),
  board_name: z.string().trim().min(1, "Board name is required").max(150),
  registration_number: z.string().trim().max(50).optional().nullable(),
  school_name: z.string().trim().min(1, "School name is required").max(255),
  school_code: z.string().trim().max(50).optional().nullable(),
  school_address: z.string().trim().max(500).optional().nullable(),
  school_state: z.string().trim().min(1, "School state is required").max(100),
  medium_of_instruction: z.string().trim().min(1).max(50),
  subjects: z
    .array(subjectMarksSchema)
    .min(1, "At least one subject is required"),
  result_summary: resultSummarySchema,
  marksheet_url: z.string().trim().url().optional().nullable(),
});

export const twelfthGradeDetailsSchema = z.object({
  academic_year: z.string().trim().min(1, "Academic year is required").max(20),
  admission_year: z
    .string()
    .trim()
    .min(1, "Admission year is required")
    .max(20),
  year_of_passing: z.number().int().min(1950).max(2100),
  board_name: z.string().trim().min(1, "Board name is required").max(150),
  registration_number: z.string().trim().max(50).optional().nullable(),
  school_name: z.string().trim().min(1, "School name is required").max(255),
  school_code: z.string().trim().max(50).optional().nullable(),
  school_address: z.string().trim().max(500).optional().nullable(),
  school_state: z.string().trim().min(1, "School state is required").max(100),
  medium_of_instruction: z.string().trim().min(1).max(50),
  // "Does your Board conduct a separate Class XI / First Year Examination?"
  has_separate_class_xi_exam: z.boolean(),
  class_xi_status: z.enum(["declared", "undeclared"]).optional().nullable(),
  subjects: z
    .array(subjectMarksSchema)
    .min(1, "At least one subject is required"),
  result_summary: resultSummarySchema,
  marksheet_url: z.string().trim().url().optional().nullable(),
  migration_certificate_url: z.string().trim().url().optional().nullable(),
});

const semesterRecordSchema = z.object({
  label: z.string().trim().min(1, "Semester/year label is required").max(50),
  duration: z.string().trim().max(50).optional().nullable(),
  gpa: z.number().min(0).max(10).optional().nullable(),
  cgpa_or_percentage: z.number().min(0).max(100).optional().nullable(),
  backlogs: z.number().int().min(0).optional().nullable(),
});

const projectEntrySchema = z.object({
  title: z.string().trim().min(1, "Project title is required").max(255),
  project_type: z.string().trim().max(50),
  duration: z.string().trim().max(50).optional().nullable(),
  team_size: z.number().int().min(1).optional().nullable(),
  role: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  key_outcomes: z.string().trim().max(1000).optional().nullable(),
  project_url: z.string().trim().url().optional().nullable(),
});

export const undergraduateDetailsSchema = z.object({
  program_type: z.enum(["regular", "distance"]),
  degree_type: z.string().trim().min(1, "Degree type is required").max(100),
  program_name: z.string().trim().min(1, "Program name is required").max(255),
  specialization: z.string().trim().max(255).optional().nullable(),
  university_name: z.string().trim().min(1, "University is required").max(255),
  university_type: z
    .string()
    .trim()
    .min(1, "University type is required")
    .max(50),
  institution_name: z
    .string()
    .trim()
    .min(1, "Institution name is required")
    .max(255),
  institution_type: z
    .string()
    .trim()
    .min(1, "Institution type is required")
    .max(50),
  admission_year: z
    .string()
    .trim()
    .min(1, "Admission year is required")
    .max(20),
  passing_year: z.string().trim().min(1, "Passing year is required").max(20),
  duration_years: z.number().int().min(1).max(10),
  register_number: z.string().trim().max(50).optional().nullable(),
  academic_cycle: z.enum(["semester", "yearly"]),
  semester_records: z.array(semesterRecordSchema).optional().default([]),
  final_summary: z.object({
    total_credits: z.number().min(0).optional().nullable(),
    cgpa: z.number().min(0).max(10).optional().nullable(),
    percentage: z.number().min(0).max(100).optional().nullable(),
    rank: z.string().trim().max(50).optional().nullable(),
    total_backlogs: z.number().int().min(0).optional().nullable(),
    result_status: z
      .string()
      .trim()
      .min(1, "Result status is required")
      .max(50),
    remarks: z.string().trim().max(500).optional().nullable(),
  }),
  documents: z
    .object({
      semester_mark_sheet_urls: z
        .array(z.string().trim().url())
        .optional()
        .default([]),
      degree_certificate_url: z.string().trim().url().optional().nullable(),
      provisional_certificate_url: z
        .string()
        .trim()
        .url()
        .optional()
        .nullable(),
      consolidated_mark_sheet_url: z
        .string()
        .trim()
        .url()
        .optional()
        .nullable(),
    })
    .optional()
    .default({ semester_mark_sheet_urls: [] }),
  has_projects: z.boolean(),
  projects: z.array(projectEntrySchema).optional().default([]),
});

// PG and Diploma are structurally identical to Undergraduate (same
// program/university/semester/final-summary/documents/projects shape) —
// reuse the same schema object rather than duplicating it.
export const pgDetailsSchema = undergraduateDetailsSchema;
export const diplomaDetailsSchema = undergraduateDetailsSchema;

export type TenthGradeDetailsInput = z.infer<typeof tenthGradeDetailsSchema>;
export type TwelfthGradeDetailsInput = z.infer<
  typeof twelfthGradeDetailsSchema
>;
export type UndergraduateDetailsInput = z.infer<
  typeof undergraduateDetailsSchema
>;
export type PgDetailsInput = UndergraduateDetailsInput;
export type DiplomaDetailsInput = UndergraduateDetailsInput;
