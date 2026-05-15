import { z } from "zod";
import {
  createPlatformPermissionSchema,
  updatePlatformPermissionSchema,
} from "@beaconu/validation";

export const platformPermissionsSchemas = {
  createPermission: createPlatformPermissionSchema,
  updatePermission: updatePlatformPermissionSchema,
};

export type CreatePlatformPermissionData = z.output<
  typeof createPlatformPermissionSchema
>;
export type UpdatePlatformPermissionData = z.output<
  typeof updatePlatformPermissionSchema
>;
