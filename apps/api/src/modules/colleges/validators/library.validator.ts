import { z } from "zod";

export const LIBRARY_TYPES = ["central", "department"] as const;

function commaNumberSchema() {
  return z
    .string()
    .trim()
    .optional()
    .default("")
    .refine(
      (value) =>
        value === "" || Number.isFinite(Number(value.replace(/,/g, ""))),
      { message: "must be a valid number" },
    );
}

const statItemSchema = z.object({
  value: commaNumberSchema(),
  label: z.string().trim().optional().default(""),
});

const resourceItemSchema = z.object({
  name: z.string().trim().optional().default(""),
  count: commaNumberSchema(),
});

const libraryHoursDaySchema = z.object({
  day: z.string().trim().optional().default(""),
  working_hours_start: z.string().trim().optional().default(""),
  working_hours_end: z.string().trim().optional().default(""),
  transaction_hours_start: z.string().trim().optional().default(""),
  transaction_hours_end: z.string().trim().optional().default(""),
});

const facilityItemSchema = z.object({
  name: z.string().trim().optional().default(""),
  image: z.string().trim().optional().default(""),
});

export const publicLibraryListParamSchema = z.object({
  slug: z.string().min(1, "College slug is required"),
});

export const publicLibraryDetailParamSchema = z.object({
  slug: z.string().min(1, "College slug is required"),
  libraryId: z.string().min(1, "Library ID is required"),
});

export const createLibrarySchema = z.object({
  type: z.enum(LIBRARY_TYPES),
  departmentId: z.string().trim().optional().nullable(),
  name: z.string().trim().min(1, "Name is required"),
  coverImageUrl: z.string().trim().optional().nullable(),
  stats: z.array(statItemSchema).optional().default([]),
  availableResources: z
    .object({ items: z.array(resourceItemSchema).optional().default([]) })
    .optional()
    .default({ items: [] }),
  libraryHours: z
    .object({ days: z.array(libraryHoursDaySchema).optional().default([]) })
    .optional()
    .default({ days: [] }),
  facilities: z
    .object({ items: z.array(facilityItemSchema).optional().default([]) })
    .optional()
    .default({ items: [] }),
});

export type CreateLibraryInput = z.infer<typeof createLibrarySchema>;

export const updateLibrarySchema = createLibrarySchema.partial();

export type UpdateLibraryInput = z.infer<typeof updateLibrarySchema>;
