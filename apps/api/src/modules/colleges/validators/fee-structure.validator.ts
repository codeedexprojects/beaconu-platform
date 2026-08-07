import { z } from "zod";

export const FEE_GENDERS = ["both", "male", "female"] as const;

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
  academicYear: z.string().trim().min(1, "academicYear is required"),
  feeCategory: z.string().trim().min(1, "feeCategory is required"),
  amount: z.number().positive("amount must be positive"),
  yearOrSemester: z.string().trim().min(1).optional().nullable(),
  gender: z.enum(FEE_GENDERS).optional(),
  instalmentAllowed: z.boolean().optional(),
  instalmentConfig: instalmentConfigSchema.optional(),
  feePdfUrl: z.string().trim().url().optional().nullable(),
});

export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>;

export const updateFeeStructureSchema = z.object({
  academicYear: z.string().trim().min(1).optional(),
  feeCategory: z.string().trim().min(1).optional(),
  amount: z.number().positive().optional(),
  yearOrSemester: z.string().trim().min(1).optional().nullable(),
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
