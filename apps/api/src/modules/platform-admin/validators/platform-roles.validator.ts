import { z } from "zod";
import {
  createPlatformRoleSchema,
  updateRolePermissionsSchema,
} from "@beaconu/validation";

export const platformRolesSchemas = {
  createRole: createPlatformRoleSchema,
  updatePermissions: updateRolePermissionsSchema,
};

export type CreatePlatformRoleData = z.output<typeof createPlatformRoleSchema>;
export type UpdatePlatformRolePermissionsData = z.output<
  typeof updateRolePermissionsSchema
>;
