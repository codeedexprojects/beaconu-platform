import { z } from "zod";

const LOAN_TYPES = ["domestic", "abroad", "both"] as const;

const helpfulVideoSchema = z.object({
  title: z.string().trim().min(1).max(255),
  url: z.string().url(),
});

const createEducationLoanSchema = z.object({
  bank_name: z.string().trim().min(1).max(255),
  bank_logo_url: z.string().url().optional(),
  product_name: z.string().trim().min(1).max(255),
  tag: z.string().trim().max(100).optional(),
  interest_rate: z.string().trim().min(1).max(100),
  interest_rate_min: z.number().positive().optional(),
  max_amount: z.string().trim().min(1).max(100),
  moratorium: z.string().trim().min(1).max(100),
  processing_fee: z.string().trim().min(1).max(100),
  loan_type: z.enum(LOAN_TYPES),
  sort_order: z.number().int().min(0).default(0),
  processing_time: z.string().trim().max(100).optional(),
  margin: z.string().trim().max(100).optional(),
  collateral_amount: z.string().trim().max(100).optional(),
  non_collateral_amount: z.string().trim().max(100).optional(),
  repayment_tenure: z.string().trim().max(100).optional(),
  requires_cosigner: z.boolean().default(false),
  description: z.string().trim().optional(),
  expenses_covered: z.array(z.string().trim().max(500)).default([]),
  eligibility: z.array(z.string().trim().max(500)).default([]),
  eligible_courses: z.string().trim().optional(),
  documents_applicant: z.array(z.string().trim().max(500)).default([]),
  documents_co_applicant: z.array(z.string().trim().max(500)).default([]),
  helpful_videos: z.array(helpfulVideoSchema).default([]),
});

const updateEducationLoanSchema = z.object({
  bank_name: z.string().trim().min(1).max(255).optional(),
  bank_logo_url: z.string().url().optional(),
  product_name: z.string().trim().min(1).max(255).optional(),
  tag: z.string().trim().max(100).optional(),
  interest_rate: z.string().trim().min(1).max(100).optional(),
  interest_rate_min: z.number().positive().nullable().optional(),
  max_amount: z.string().trim().min(1).max(100).optional(),
  moratorium: z.string().trim().min(1).max(100).optional(),
  processing_fee: z.string().trim().min(1).max(100).optional(),
  loan_type: z.enum(LOAN_TYPES).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  sort_order: z.number().int().min(0).optional(),
  processing_time: z.string().trim().max(100).optional(),
  margin: z.string().trim().max(100).optional(),
  collateral_amount: z.string().trim().max(100).optional(),
  non_collateral_amount: z.string().trim().max(100).optional(),
  repayment_tenure: z.string().trim().max(100).optional(),
  requires_cosigner: z.boolean().optional(),
  description: z.string().trim().optional(),
  expenses_covered: z.array(z.string().trim().max(500)).optional(),
  eligibility: z.array(z.string().trim().max(500)).optional(),
  eligible_courses: z.string().trim().optional(),
  documents_applicant: z.array(z.string().trim().max(500)).optional(),
  documents_co_applicant: z.array(z.string().trim().max(500)).optional(),
  helpful_videos: z.array(helpfulVideoSchema).optional(),
});

const listEducationLoansQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  status: z.enum(["active", "inactive"]).optional(),
  loan_type: z.enum(LOAN_TYPES).optional(),
  search: z.string().optional(),
});

const idParamSchema = z.object({
  id: z.string(),
});

export const educationLoanSchemas = {
  create: createEducationLoanSchema,
  update: updateEducationLoanSchema,
  listQuery: listEducationLoansQuerySchema,
  idParam: idParamSchema,
};

export type CreateEducationLoanInput = z.infer<
  typeof createEducationLoanSchema
>;
export type UpdateEducationLoanInput = z.infer<
  typeof updateEducationLoanSchema
>;
export type ListEducationLoansQuery = z.infer<
  typeof listEducationLoansQuerySchema
>;
