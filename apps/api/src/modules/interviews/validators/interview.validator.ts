import { z } from "zod";

const HHMM = /^\d{2}:\d{2}$/;
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD");
const timeOnly = z.string().regex(HHMM, "HH:MM");

const MODES = ["gmeet", "telephonic", "on_campus"] as const;

export const scheduleInterviewSchema = z
  .object({
    scheduled_date: dateOnly,
    start_time: timeOnly,
    end_time: timeOnly,
    panel_member_id: z.string().trim().min(1),
    mode: z.enum(MODES),
    venue: z.string().trim().max(255).optional(),
  })
  .refine((data) => data.mode !== "on_campus" || !!data.venue, {
    message: "venue is required for on_campus interviews",
    path: ["venue"],
  });

export const completeInterviewSchema = z.object({
  interview_score: z.coerce.number().min(0).optional(),
  interview_outcome: z.enum(["recommended", "not_recommended"]).optional(),
  interview_remarks: z.string().trim().max(2000).optional(),
});

export const listInterviewBookingsQuerySchema = z.object({
  status: z.enum(["pending", "scheduled", "completed", "cancelled"]).optional(),
  search: z.string().trim().min(1).optional(),
});

export const panelAvailabilityQuerySchema = z.object({
  scheduled_date: dateOnly,
  start_time: timeOnly,
  end_time: timeOnly,
  search: z.string().trim().min(1).optional(),
  exclude_booking_id: z.string().trim().min(1).optional(),
});

export const shortlistCourseSchema = z.object({
  document_url: z.string().trim().min(1, "Offer letter document is required"),
  valid_until: dateOnly,
});

export type ScheduleInterviewBody = z.infer<typeof scheduleInterviewSchema>;
export type CompleteInterviewBody = z.infer<typeof completeInterviewSchema>;
