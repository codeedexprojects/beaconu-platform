import { z } from "zod";
import { commonSchemas } from "@/shared/validators";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const registerAssociateAdminSchema = z
  .object({
    full_name: z.string().min(1),
    email: commonSchemas.email,
    phone_number: z.string().optional(),
    country: z.string().optional(),
    agency_name: z.string().min(1),
    agency_reg_number: z.string().min(1),
    password: commonSchemas.password,
    confirm_password: commonSchemas.password,
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const registerAssociateEmployeeSchema = z
  .object({
    full_name: z.string().min(1),
    email: commonSchemas.email,
    phone_number: z.string().optional(),
    associate_parent_id: z
      .string()
      .trim()
      .refine(
        (value) =>
          !value.includes("{{") &&
          !value.includes("}}") &&
          uuidRegex.test(value),
        { message: "Invalid UUID for associate_parent_id" },
      ),
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
    college_id: z.string().uuid(),
    linked_student_id: z.string().uuid().optional(),
    ambassador_type: z.enum(["student", "teacher"]),
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

export type RegisterAssociateAdminInput = z.infer<
  typeof registerAssociateAdminSchema
>;
export type RegisterAssociateEmployeeInput = z.infer<
  typeof registerAssociateEmployeeSchema
>;
export type RegisterAmbassadorInput = z.infer<typeof registerAmbassadorSchema>;
export type UpdateEmployeeStatusInput = z.infer<
  typeof updateEmployeeStatusSchema
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
  createdByStaffId?: string;
}
