import { z } from "zod";

export const FEE_GENDERS = ["both", "male", "female"] as const;

export const FEE_CATEGORIES = [
  "tuition_fee",
  "admission_fee",
  "application_fee",
  "registration_fee",
  "development_fee",
  "examination_fee",
  "library_fee",
  "laboratory_fee",
  "sports_fee",
  "clinical_fee",
  "hostel_fee",
  "caution_deposit",
  "other_fee",
] as const;

export const YEAR_OR_SEMESTER_OPTIONS = [
  "One-time",
  "Annual",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
  "Semester 9",
  "Semester 10",
  "Semester 11",
  "Semester 12",
] as const;

const ACADEMIC_YEAR_REGEX = /^\d{4}-\d{2}$/;
const academicYearSchema = z
  .string()
  .trim()
  .regex(
    ACADEMIC_YEAR_REGEX,
    "Academic year must be in YYYY-YY format (e.g. 2026-27)",
  );

const instalmentItemSchema = z.object({
  label: z.string().trim().min(1, "label is required"),
  amount: z.number().positive("amount must be positive"),
  dueDate: z.string().trim().min(1).optional(),
  dueWithin: z.string().trim().min(1).optional(),
  dueBy: z.string().trim().min(1).optional(),
  dueAfter: z.string().trim().min(1).optional(),
});

const instalmentConfigSchema = z.object({
  instalments: z.array(instalmentItemSchema).min(1),
});

export const createFeeStructureSchema = z.object({
  academicYear: academicYearSchema,
  feeCategory: z.enum(FEE_CATEGORIES),
  amount: z.number().positive("amount must be positive"),
  yearOrSemester: z.enum(YEAR_OR_SEMESTER_OPTIONS).optional().nullable(),
  gender: z.enum(FEE_GENDERS).optional(),
  instalmentAllowed: z.boolean().optional(),
  instalmentConfig: instalmentConfigSchema.optional(),
  feePdfUrl: z.string().trim().url().optional().nullable(),
});

export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>;

export const updateFeeStructureSchema = z.object({
  academicYear: academicYearSchema.optional(),
  feeCategory: z.enum(FEE_CATEGORIES).optional(),
  amount: z.number().positive().optional(),
  yearOrSemester: z.enum(YEAR_OR_SEMESTER_OPTIONS).optional().nullable(),
  gender: z.enum(FEE_GENDERS).optional(),
  instalmentAllowed: z.boolean().optional(),
  instalmentConfig: instalmentConfigSchema.optional(),
  feePdfUrl: z.string().trim().url().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type UpdateFeeStructureInput = z.infer<typeof updateFeeStructureSchema>;

export const feeStructureParamSchema = z.object({
  id: z.string().min(1, "Course ID is required"),
  feeStructureId: z.string().min(1, "Fee structure ID is required"),
});

export const courseIdOnlyParamSchema = z.object({
  id: z.string().min(1, "Course ID is required"),
});
