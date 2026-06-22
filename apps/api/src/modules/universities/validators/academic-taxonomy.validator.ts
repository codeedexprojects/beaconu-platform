import { z } from "zod";

const optionalBooleanFromQuery = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) =>
    typeof value === "boolean" ? value : value === "true",
  );

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_-]+$/);

export const academicTaxonomySchemas = {
  idParam: z.object({
    id: z.string(),
  }),

  listDisciplinesQuery: z.object({
    is_active: optionalBooleanFromQuery.optional(),
    stream_id: z.string().optional(),
  }),

  listSimpleQuery: z.object({
    is_active: optionalBooleanFromQuery.optional(),
  }),

  adminListQuery: z.object({
    search: z.string().optional(),
    is_active: optionalBooleanFromQuery.optional(),
    stream_id: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v))
      .pipe(z.string().optional()),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(500).optional().default(10),
  }),

  publicListQuery: z.object({
    search: z.string().optional(),
    university_id: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v))
      .pipe(z.string().optional()),
    discipline_id: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v))
      .pipe(z.string().optional()),
    stream_id: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v))
      .pipe(z.string().optional()),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  }),

  createStream: z.object({
    name: z.string().trim().min(1).max(100),
    slug: slugSchema.max(50),
    logo_url: z
      .string()
      .url()
      .regex(/\.svg$/i, "Logo must be an SVG file (1:1 ratio)")
      .optional(),
    sort_order: z.number().int().min(0).optional().default(0),
    is_active: z.boolean().optional().default(true),
  }),

  updateStream: z
    .object({
      name: z.string().trim().min(1).max(100).optional(),
      slug: slugSchema.max(50).optional(),
      logo_url: z
        .string()
        .url()
        .regex(/\.svg$/i, "Logo must be an SVG file (1:1 ratio)")
        .optional(),
      sort_order: z.number().int().min(0).optional(),
      is_active: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required",
    }),

  createDiscipline: z.object({
    stream_id: z.string(),
    name: z.string().trim().min(1).max(100),
    slug: slugSchema.max(50),
    logo_url: z
      .string()
      .url()
      .regex(/\.svg$/i, "Logo must be an SVG file (1:1 ratio)")
      .optional(),
    sort_order: z.number().int().min(0).optional().default(0),
    is_active: z.boolean().optional().default(true),
  }),

  updateDiscipline: z
    .object({
      stream_id: z.string().optional(),
      name: z.string().trim().min(1).max(100).optional(),
      slug: slugSchema.max(50).optional(),
      logo_url: z
        .string()
        .url()
        .regex(/\.svg$/i, "Logo must be an SVG file (1:1 ratio)")
        .optional(),
      sort_order: z.number().int().min(0).optional(),
      is_active: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required",
    }),

  createStudyLevel: z.object({
    name: z.string().trim().min(1).max(50),
    slug: slugSchema.max(30),
    logo_url: z
      .string()
      .url()
      .regex(/\.svg$/i, "Logo must be an SVG file (1:1 ratio)")
      .optional(),
    sort_order: z.number().int().min(0).optional().default(0),
    is_active: z.boolean().optional().default(true),
  }),

  updateStudyLevel: z
    .object({
      name: z.string().trim().min(1).max(50).optional(),
      slug: slugSchema.max(30).optional(),
      logo_url: z
        .string()
        .url()
        .regex(/\.svg$/i, "Logo must be an SVG file (1:1 ratio)")
        .optional(),
      sort_order: z.number().int().min(0).optional(),
      is_active: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required",
    }),

  createProgramType: z.object({
    name: z.string().trim().min(1).max(50),
    slug: slugSchema.max(30),
    logo_url: z
      .string()
      .url()
      .regex(/\.svg$/i, "Logo must be an SVG file (1:1 ratio)")
      .optional(),
    sort_order: z.number().int().min(0).optional().default(0),
    is_active: z.boolean().optional().default(true),
  }),

  updateProgramType: z
    .object({
      name: z.string().trim().min(1).max(50).optional(),
      slug: slugSchema.max(30).optional(),
      logo_url: z
        .string()
        .url()
        .regex(/\.svg$/i, "Logo must be an SVG file (1:1 ratio)")
        .optional(),
      sort_order: z.number().int().min(0).optional(),
      is_active: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required",
    }),
};

export type ListDisciplinesQuery = z.output<
  typeof academicTaxonomySchemas.listDisciplinesQuery
>;
export type ListSimpleQuery = z.output<
  typeof academicTaxonomySchemas.listSimpleQuery
>;
export type AdminListQuery = z.output<
  typeof academicTaxonomySchemas.adminListQuery
>;
export type PublicListQuery = z.output<
  typeof academicTaxonomySchemas.publicListQuery
>;
export type CreateStreamInput = z.output<
  typeof academicTaxonomySchemas.createStream
>;
export type UpdateStreamInput = z.output<
  typeof academicTaxonomySchemas.updateStream
>;
export type CreateDisciplineInput = z.output<
  typeof academicTaxonomySchemas.createDiscipline
>;
export type UpdateDisciplineInput = z.output<
  typeof academicTaxonomySchemas.updateDiscipline
>;
export type CreateStudyLevelInput = z.output<
  typeof academicTaxonomySchemas.createStudyLevel
>;
export type UpdateStudyLevelInput = z.output<
  typeof academicTaxonomySchemas.updateStudyLevel
>;
export type CreateProgramTypeInput = z.output<
  typeof academicTaxonomySchemas.createProgramType
>;
export type UpdateProgramTypeInput = z.output<
  typeof academicTaxonomySchemas.updateProgramType
>;
