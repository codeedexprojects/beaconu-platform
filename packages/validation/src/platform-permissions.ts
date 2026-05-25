import { z } from "zod";

export const createPlatformPermissionSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9.]+$/,
      "Permission code can only contain lowercase letters, numbers, and dots",
    ),
  description: z.string().trim().max(255).optional(),
});

export const updatePlatformPermissionSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9.]+$/,
      "Permission code can only contain lowercase letters, numbers, and dots",
    ),
  description: z.string().trim().max(255).optional(),
});

export type CreatePlatformPermissionInput = z.input<
  typeof createPlatformPermissionSchema
>;
export type UpdatePlatformPermissionInput = z.input<
  typeof updatePlatformPermissionSchema
>;
