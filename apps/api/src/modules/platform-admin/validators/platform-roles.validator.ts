import { z } from "zod";
import {
  createPlatformRoleSchema,
  updateRolePermissionsSchema,
} from "@beaconu/validation";

export const platformRolesSchemas = {
  createRole: createPlatformRoleSchema,
  updatePermissions: updateRolePermissionsSchema,
};

// Backend services receive Zod-parsed data — defaults are already filled in, use output types.
export type CreatePlatformRoleData = z.output<typeof createPlatformRoleSchema>;
export type UpdatePlatformRolePermissionsData = z.output<
  typeof updateRolePermissionsSchema
>;
