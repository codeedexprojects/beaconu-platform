import { z } from "zod";

const HHMM = /^\d{2}:\d{2}$/;
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD");
const timeOnly = z.string().regex(HHMM, "HH:MM");

const MODES = ["gmeet", "telephonic", "on_campus"] as const;

// No manual meeting_url/meeting_id/meeting_passcode — for "gmeet" mode
// these are always auto-generated via the Google Meet integration, never
// entered by hand. No manual phone_number either — for "telephonic" mode
// the interviewer calls the student's own phone number, not a
// college-entered one.
export const createInterviewSlotSchema = z.object({
  mode: z.enum(MODES),
  scheduled_date: dateOnly,
  start_time: timeOnly,
  end_time: timeOnly,
  duration_mins: z.coerce.number().int().positive().optional(),
  max_capacity: z.coerce.number().int().positive().optional(),
  venue: z.string().trim().max(255).optional(),
  interviewer_id: z.string().trim().min(1).optional(),
});

export const updateInterviewSlotSchema = z.object({
  mode: z.enum(MODES).optional(),
  scheduled_date: dateOnly.optional(),
  start_time: timeOnly.optional(),
  end_time: timeOnly.optional(),
  duration_mins: z.coerce.number().int().positive().optional(),
  max_capacity: z.coerce.number().int().positive().optional(),
  venue: z.string().trim().max(255).optional(),
  interviewer_id: z.string().trim().min(1).optional(),
});

export const listInterviewSlotsQuerySchema = z.object({
  mode: z.enum(MODES).optional(),
  status: z.enum(["active", "cancelled"]).optional(),
});

// Students aren't scoped to one college via their JWT (they can apply to
// several) — college_id must be supplied explicitly, same pattern as
// other cross-college student-facing reads in this codebase.
export const listAvailableSlotsQuerySchema = z.object({
  college_id: z.string().trim().min(1),
  mode: z.enum(MODES).optional(),
});

export const bookInterviewSlotSchema = z.object({
  application_course_id: z.string().trim().min(1),
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

// to_slot_id is optional here even when approving — the service falls
// back to the reschedule request's own to_slot_id if one was already
// submitted, and only then validates that at least one is present.
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
export type BookInterviewSlotBody = z.infer<typeof bookInterviewSlotSchema>;
export type CompleteInterviewBody = z.infer<typeof completeInterviewSchema>;
export type RequestInterviewRescheduleBody = z.infer<
  typeof requestInterviewRescheduleSchema
>;
export type ReviewInterviewRescheduleBody = z.infer<
  typeof reviewInterviewRescheduleSchema
>;
