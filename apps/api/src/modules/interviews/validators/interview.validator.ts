import { z } from "zod";

const HHMM = /^\d{2}:\d{2}$/;
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD");
const timeOnly = z.string().regex(HHMM, "HH:MM");

const MODES = ["gmeet", "on_campus"] as const;

export const createInterviewSlotSchema = z.object({
  mode: z.enum(MODES),
  scheduled_date: dateOnly,
  start_time: timeOnly,
  end_time: timeOnly,
  duration_mins: z.coerce.number().int().positive().optional(),
  campus_id: z.string().trim().min(1).optional(),
  venue: z.string().trim().max(255).optional(),
  interviewer_id: z.string().trim().min(1).optional(),
  interviewer_email: z.email().trim().optional(),
});

export const updateInterviewSlotSchema = z.object({
  mode: z.enum(MODES).optional(),
  scheduled_date: dateOnly.optional(),
  start_time: timeOnly.optional(),
  end_time: timeOnly.optional(),
  duration_mins: z.coerce.number().int().positive().optional(),
  campus_id: z.string().trim().min(1).optional(),
  venue: z.string().trim().max(255).optional(),
  interviewer_id: z.string().trim().min(1).optional(),
  interviewer_email: z.email().trim().optional(),
});

const modeInstructionsSchema = z.object({
  heading: z.string().trim().max(255).optional(),
  description: z.string().trim().max(2000).optional(),
  instructions: z.array(z.string().trim().min(1)).max(20).optional(),
});

export const updateInterviewSettingsSchema = z
  .object({
    allow_gmeet: z.boolean().optional(),
    allow_on_campus: z.boolean().optional(),
    gmeet: modeInstructionsSchema.optional(),
    on_campus: modeInstructionsSchema.optional(),
  })
  .refine(
    (data) =>
      data.allow_gmeet !== undefined ||
      data.allow_on_campus !== undefined ||
      data.gmeet !== undefined ||
      data.on_campus !== undefined,
    { message: "Provide at least one field to update" },
  );

export const listInterviewSlotsQuerySchema = z.object({
  mode: z.enum(MODES).optional(),
  status: z.enum(["active", "cancelled"]).optional(),
});

export const listAvailableSlotsQuerySchema = z
  .object({
    college_id: z.string().trim().min(1),
    mode: z.enum(MODES).optional(),
    scheduled_date: dateOnly.optional(),
    date_from: dateOnly.optional(),
    date_to: dateOnly.optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  })
  .refine(
    (data) =>
      !(data.date_from && data.date_to) || data.date_from <= data.date_to,
    {
      message: "date_from must be before or equal to date_to",
      path: ["date_from"],
    },
  );

export const bookInterviewSlotSchema = z.object({
  application_id: z.string().trim().min(1),
  slot_id: z.string().trim().min(1),
});

export const completeInterviewSchema = z.object({
  interview_score: z.coerce.number().min(0).optional(),
  interview_outcome: z.enum(["recommended", "not_recommended"]).optional(),
  interview_remarks: z.string().trim().max(2000).optional(),
});

export const requestInterviewRescheduleSchema = z.object({
  to_slot_id: z.string().trim().min(1).optional(),
  reason: z.string().trim().min(1, "Reason is required").max(1000),
});

export const reviewInterviewRescheduleSchema = z.object({
  action: z.enum(["approve", "reject"]),
  to_slot_id: z.string().trim().min(1).optional(),
  review_remarks: z.string().trim().max(1000).optional(),
});

export const listInterviewBookingsQuerySchema = z.object({
  status: z.enum(["booked", "completed", "cancelled"]).optional(),
});

export const listInterviewReschedulesQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export type CreateInterviewSlotBody = z.infer<typeof createInterviewSlotSchema>;
export type UpdateInterviewSlotBody = z.infer<typeof updateInterviewSlotSchema>;
export type UpdateInterviewSettingsBody = z.infer<
  typeof updateInterviewSettingsSchema
>;
export type BookInterviewSlotBody = z.infer<typeof bookInterviewSlotSchema>;
export type CompleteInterviewBody = z.infer<typeof completeInterviewSchema>;
export type RequestInterviewRescheduleBody = z.infer<
  typeof requestInterviewRescheduleSchema
>;
export type ReviewInterviewRescheduleBody = z.infer<
  typeof reviewInterviewRescheduleSchema
>;
