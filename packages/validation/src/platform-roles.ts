import { z } from "zod";

export const createPlatformRoleSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]+$/),
  permissions: z.array(z.string().trim().min(1)).default([]),
  is_system_role: z.boolean().optional().default(false),
});

export const updateRolePermissionsSchema = z.object({
  permissions: z.array(z.string().trim().min(1)).min(1),
});

export type CreatePlatformRoleInput = z.input<typeof createPlatformRoleSchema>;
export type UpdateRolePermissionsInput = z.input<
  typeof updateRolePermissionsSchema
>;
