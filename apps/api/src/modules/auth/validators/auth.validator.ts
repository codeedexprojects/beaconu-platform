import { z } from "zod";
import { commonSchemas } from "@/shared/validators";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
  agency_reg_number: z.string().trim().optional(),
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
    full_name: z.string().trim().min(1),
    email: commonSchemas.email,
    phone_number: z.string().trim().optional(),
    country: z.string().trim().optional(),
    agency_name: z.string().trim().min(1),
    agency_reg_number: z.string().trim().min(1),
    password: commonSchemas.password,
    confirm_password: commonSchemas.password,
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const registerEmployeeSchema = z
  .object({
    full_name: z.string().trim().min(1),
    email: commonSchemas.email,
    agency_reg_number: z.string().trim().min(1),
    password: commonSchemas.password,
    confirm_password: commonSchemas.password,
    phone_number: z.string().trim().optional(),
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

export const loginBlogAuthorSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type PlatformLoginInput = z.infer<typeof platformLoginSchema>;
export type RegisterCounsellorInput = z.infer<typeof registerCounsellorSchema>;
export type RegisterAssociateAdminInput = z.infer<
  typeof registerAssociateAdminSchema
>;
export type RegisterEmployeeInput = z.infer<typeof registerEmployeeSchema>;
export type RegisterBlogAuthorInput = z.infer<typeof registerBlogAuthorSchema>;
export type LoginBlogAuthorInput = z.infer<typeof loginBlogAuthorSchema>;
