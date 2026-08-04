import { z } from "zod";

export const createPlatformAdminSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(255),
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  platformRoleId: z.string().uuid("Please select a valid role"),
});

export const updatePlatformAdminSchema = createPlatformAdminSchema
  .partial()
  .extend({
    password: z.string().min(6).optional(),
  });

export const updatePlatformAdminStatusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});

export type CreatePlatformAdminData = z.output<
  typeof createPlatformAdminSchema
>;
export type UpdatePlatformAdminData = z.output<
  typeof updatePlatformAdminSchema
>;
export type UpdatePlatformAdminStatusData = z.output<
  typeof updatePlatformAdminStatusSchema
>;
