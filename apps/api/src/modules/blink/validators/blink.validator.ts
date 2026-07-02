import { z } from "zod";
import { commonSchemas } from "@/shared/validators";

export const registerAssociateEmployeeSchema = z
  .object({
    full_name: z.string().min(1),
    email: commonSchemas.email,
    phone_number: z.string().optional(),
    associate_parent_id: z
      .string()
      .trim()
      .min(1, "associate_parent_id is required"),
    password: commonSchemas.password,
    confirm_password: commonSchemas.password,
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const registerAmbassadorSchema = z
  .object({
    full_name: z.string().min(1),
    email: commonSchemas.email,
    phone_number: z.string().optional(),
    college_id: z.string(),
    linked_student_id: z.string().optional(),
    ambassador_type: z.enum(["student", "teacher"]),
    avatar_url: z.string().trim().url().optional().nullable(),
    course: z.string().trim().optional(),
    district: z.string().trim().optional(),
    state: z.string().trim().optional(),
    password: commonSchemas.password,
    confirm_password: commonSchemas.password,
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const updateEmployeeStatusSchema = z.object({
  status: z.enum(["active", "inactive", "suspended", "rejected"]),
});

export const updateAmbassadorSchema = z
  .object({
    full_name: z.string().min(1).optional(),
    phone_number: z.string().optional(),
    ambassador_type: z.enum(["student", "teacher"]).optional(),
    avatar_url: z.string().trim().url().optional().nullable(),
    course: z.string().trim().optional(),
    district: z.string().trim().optional(),
    state: z.string().trim().optional(),
    status: z.enum(["active", "inactive"]).optional(),
    password: commonSchemas.password.optional(),
    confirm_password: z.string().optional(),
  })
  .refine((data) => !data.password || data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const employeeRankingQuerySchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine((d) => !d.from || !d.to || d.from <= d.to, {
    message: "`from` must be before or equal to `to`",
    path: ["from"],
  });

export type EmployeeRankingQuery = z.infer<typeof employeeRankingQuerySchema>;

export const dashboardSummaryQuerySchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine((d) => !d.from || !d.to || d.from <= d.to, {
    message: "`from` must be before or equal to `to`",
    path: ["from"],
  });

export type DashboardSummaryQuery = z.infer<typeof dashboardSummaryQuerySchema>;

export const employeeListQuerySchema = z.object({
  status: z
    .enum(["active", "inactive", "suspended", "rejected", "pending_approval"])
    .optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>;

export const referralListQuerySchema = z.object({
  status: z
    .enum(["registered", "rejected", "confirmed", "dropped_out"])
    .optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type RegisterAssociateEmployeeInput = z.infer<
  typeof registerAssociateEmployeeSchema
>;
export type RegisterAmbassadorInput = z.infer<typeof registerAmbassadorSchema>;
export type UpdateEmployeeStatusInput = z.infer<
  typeof updateEmployeeStatusSchema
>;
export type UpdateAmbassadorInput = z.infer<typeof updateAmbassadorSchema>;
export type ReferralListQuery = z.infer<typeof referralListQuerySchema>;

export const bankDetailsSchema = z.object({
  accountHolderName: z.string().min(1, "Account holder name is required"),
  accountNumber: z
    .string()
    .regex(/^\d{9,18}$/, "Account number must be 9–18 digits"),
  ifsc: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code (e.g. SBIN0001234)"),
  bankName: z.string().min(1, "Bank name is required"),
});

export const withdrawalSchema = z.object({
  amount: z
    .number({ error: "Amount must be a number" })
    .positive("Amount must be greater than zero"),
  description: z.string().max(255).optional(),
});

export const walletTransactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type BankDetailsInput = z.infer<typeof bankDetailsSchema>;
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
export type WalletTransactionQuery = z.infer<
  typeof walletTransactionQuerySchema
>;

export const serviceChargeQuerySchema = z.object({
  collegeId: z.string().optional(),
  courseId: z.string().optional(),
  academicYear: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const updateServiceChargeSchema = z
  .object({
    grossAmount: z.number().positive("grossAmount must be positive").optional(),
    gstPercentage: z
      .number()
      .min(0, "gstPercentage must be ≥ 0")
      .max(100, "gstPercentage must be ≤ 100")
      .optional(),
    termsAndConditions: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });

export type ServiceChargeQuery = z.infer<typeof serviceChargeQuerySchema>;

export const collegeListQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CollegeListQuery = z.infer<typeof collegeListQuerySchema>;

export const universityListQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type UniversityListQuery = z.infer<typeof universityListQuerySchema>;

export const streamListQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type StreamListQuery = z.infer<typeof streamListQuerySchema>;
export type UpdateServiceChargeInput = z.infer<
  typeof updateServiceChargeSchema
>;

export interface BlinkUserCreateData {
  fullName: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string;
  country?: string;
  agencyName?: string;
  agencyRegNumber?: string;
  associateParentId?: string;
  roleId: string;
  status: string;
  collegeId?: string;
  linkedStudentId?: string;
  ambassadorType?: string;
  campusCode?: string;
  createdByStaffId?: string;
  avatarUrl?: string | null;
  profileMetadata?: Record<string, unknown>;
}
