import { z } from 'zod';

export const platformRolesSchemas = {
  createRole: z.object({
    name: z.string().trim().min(1).max(100),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9_]+$/),
    permissions: z.array(z.string().trim().min(1)).default([]),
    is_system_role: z.boolean().optional().default(false),
  }),
  updatePermissions: z.object({
    permissions: z.array(z.string().trim().min(1)).min(1),
  }),
};

export type CreatePlatformRoleData = z.infer<typeof platformRolesSchemas.createRole>;
export type UpdatePlatformRolePermissionsData = z.infer<typeof platformRolesSchemas.updatePermissions>;
