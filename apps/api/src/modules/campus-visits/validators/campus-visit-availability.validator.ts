import { z } from "zod";

export const upsertAvailabilitySchema = z.object({
  weekday: z.coerce.number().int().min(0).max(6),
  max_capacity: z.coerce.number().int().min(1).default(1),
  is_off: z.coerce.boolean().default(false),
});

export const upsertSettingsSchema = z
  .object({
    visit_start_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Valid start time is required (HH:MM)"),
    visit_end_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Valid end time is required (HH:MM)"),
  })
  .refine((val) => val.visit_end_time > val.visit_start_time, {
    message: "End time must be after start time",
    path: ["visit_end_time"],
  });

export const createDateOverrideSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Valid date is required (YYYY-MM-DD)"),
  reason: z.string().trim().max(500).optional(),
});

export const monthCalendarQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export const cancelByAdminSchema = z.object({
  message: z.string().trim().min(1, "A message for the student is required"),
});

export const bulkCancelForDateSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Valid date is required (YYYY-MM-DD)"),
  message: z.string().trim().min(1, "A message for the student is required"),
});

export const studentAvailabilityQuerySchema = z.object({
  college_id: z.string().min(1, "College is required"),
});

export type UpsertAvailabilityInput = z.infer<typeof upsertAvailabilitySchema>;
export type StudentAvailabilityQuery = z.infer<
  typeof studentAvailabilityQuerySchema
>;
export type UpsertSettingsInput = z.infer<typeof upsertSettingsSchema>;
export type CreateDateOverrideInput = z.infer<typeof createDateOverrideSchema>;
export type MonthCalendarQuery = z.infer<typeof monthCalendarQuerySchema>;
export type CancelByAdminInput = z.infer<typeof cancelByAdminSchema>;
export type BulkCancelForDateInput = z.infer<typeof bulkCancelForDateSchema>;
