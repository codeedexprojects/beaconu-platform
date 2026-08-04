import { z } from "zod";

const optionalBooleanFromQuery = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) =>
    typeof value === "boolean" ? value : value === "true",
  );

const createIconSchema = z.object({
  name: z.string().trim().min(1, "Icon name is required").max(150),
  icon_url: z.string().trim().min(1, "Icon file is required"),
});

const updateIconSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    icon_url: z.string().trim().min(1).optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const listIconsQuerySchema = z.object({
  is_active: optionalBooleanFromQuery.optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const idParamSchema = z.object({
  id: z.string(),
});

const listActiveIconsQuerySchema = z.object({
  search: z.string().trim().optional(),
});

export const iconSchemas = {
  create: createIconSchema,
  update: updateIconSchema,
  listQuery: listIconsQuerySchema,
  idParam: idParamSchema,
  listActiveQuery: listActiveIconsQuerySchema,
};

export type CreateIconInput = z.infer<typeof createIconSchema>;
export type UpdateIconInput = z.infer<typeof updateIconSchema>;
export type ListIconsQuery = z.infer<typeof listIconsQuerySchema>;
export type ListActiveIconsQuery = z.infer<typeof listActiveIconsQuerySchema>;
