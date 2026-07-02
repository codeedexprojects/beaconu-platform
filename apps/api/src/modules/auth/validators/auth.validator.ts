import { z } from "zod";
import { commonSchemas } from "@/shared/validators";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
  blink_role: z
    .enum(["associate_admin", "associate_employee", "campus_ambassador"])
    .optional(),
  agency_reg_number: z.string().trim().optional(),
  campus_code: z.string().trim().optional(),
  fcm_token: z.string().trim().optional(),
});

export const staffLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
  collegeSlug: z.string().trim().min(1).toLowerCase(),
});

export const platformLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
});

export const registerCounsellorSchema = z
  .object({
    full_name: z.string().trim().min(1),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6),
    confirm_password: z.string().min(6),
    phone_number: z.string().trim().optional(),
    counsellor_type: z.enum(["academic", "mindcare"]),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const registerAssociateAdminSchema = z
  .object({
    full_name: z.string().trim().min(1).max(255),
    email: commonSchemas.email,
    phone_number: commonSchemas.phoneNumber
      .max(15, "Phone number must be under 15 characters")
      .optional(),
    country: z
      .string()
      .trim()
      .max(100, "Country must be under 100 characters")
      .optional(),
    agency_name: z.string().trim().min(1).max(255),
    agency_reg_number: z
      .string()
      .trim()
      .min(1)
      .max(100, "Registration number must be under 100 characters"),
    password: commonSchemas.password,
    confirm_password: commonSchemas.password,
    companyPan: z
      .string()
      .trim()
      .min(1, "Company PAN is required")
      .max(50, "Company PAN must be under 50 characters"),
    currentAccNo: z
      .string()
      .trim()
      .min(1, "Current Account Number is required")
      .max(50, "Current Account Number must be under 50 characters"),
    ifsc: z
      .string()
      .trim()
      .min(1, "IFSC is required")
      .max(20, "IFSC must be under 20 characters"),
    gstin: z
      .string()
      .trim()
      .max(50, "GSTIN must be under 50 characters")
      .optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const registerEmployeeSchema = z
  .object({
    full_name: z.string().trim().min(1).max(255),
    email: commonSchemas.email,
    agency_reg_number: z
      .string()
      .trim()
      .min(1)
      .max(100, "Registration number must be under 100 characters"),
    password: commonSchemas.password,
    confirm_password: commonSchemas.password,
    phone_number: commonSchemas.phoneNumber
      .max(15, "Phone number must be under 15 characters")
      .optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const registerBlogAuthorSchema = z
  .object({
    full_name: z.string().trim().min(1).max(255),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6),
    confirm_password: z.string().min(6),
    bio: z.string().trim().max(1000).optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const counsellorLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
  counsellor_type: z.enum(["academic", "mindcare"], {
    error: "counsellor_type must be 'academic' or 'mindcare'",
  }),
  counsellor_code: z.string().trim().optional(),
  fcm_token: z.string().trim().optional(),
});

export const loginBlogAuthorSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CounsellorLoginInput = z.infer<typeof counsellorLoginSchema>;
export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
export type PlatformLoginInput = z.infer<typeof platformLoginSchema>;
export type RegisterCounsellorInput = z.infer<typeof registerCounsellorSchema>;
export type RegisterAssociateAdminInput = z.infer<
  typeof registerAssociateAdminSchema
>;
export type RegisterEmployeeInput = z.infer<typeof registerEmployeeSchema>;
export type RegisterBlogAuthorInput = z.infer<typeof registerBlogAuthorSchema>;
export type LoginBlogAuthorInput = z.infer<typeof loginBlogAuthorSchema>;

export const sendStudentOtpSchema = z.object({
  phone_number: z.string().trim().min(10).max(15),
  phone_country_code: z.string().trim().default("+91"),
});

export const verifyStudentOtpSchema = z.object({
  phone_number: z.string().trim().min(10).max(15),
  phone_country_code: z.string().trim().default("+91"),
  otp: z.string().length(4),
  fcm_token: z.string().trim().optional(),
});

export const registerStudentSchema = z.object({
  full_name: z.string().trim().min(1).max(255),
  email: z.string().trim().toLowerCase().email().optional(),
  phone_number: z.string().trim().min(10).max(15),
  phone_country_code: z.string().trim().default("+91"),
  registration_token: z.string().min(1),
  fcm_token: z.string().trim().optional(),
});

export const firebaseStudentLoginSchema = z.object({
  id_token: z.string().min(1, "Firebase ID token is required"),
  fcm_token: z.string().trim().optional(),
});

export type SendStudentOtpInput = z.infer<typeof sendStudentOtpSchema>;
export type VerifyStudentOtpInput = z.infer<typeof verifyStudentOtpSchema>;
export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;
export type FirebaseStudentLoginInput = z.infer<
  typeof firebaseStudentLoginSchema
>;

// ── Blink forgot-password ──────────────────────────────────────────────────

export const blinkForgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const blinkVerifyResetOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  otp: z.string().trim().length(4),
});

export const blinkResetPasswordSchema = z.object({
  reset_token: z.string().uuid(),
  new_password: z.string().min(8),
});

export type BlinkForgotPasswordInput = z.infer<
  typeof blinkForgotPasswordSchema
>;
export type BlinkVerifyResetOtpInput = z.infer<
  typeof blinkVerifyResetOtpSchema
>;
export type BlinkResetPasswordInput = z.infer<typeof blinkResetPasswordSchema>;
