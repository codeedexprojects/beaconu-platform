import z from "zod";

// Counsellor: add a slot
export const addSlotSchema = z.object({
  available_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
    .optional(),
  available_dates: z
    .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"))
    .optional(),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "HH:MM")
    .optional(),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "HH:MM")
    .optional(),
  time_slots: z
    .array(
      z.object({
        start_time: z.string().regex(/^\d{2}:\d{2}$/, "HH:MM"),
        end_time: z.string().regex(/^\d{2}:\d{2}$/, "HH:MM"),
      }),
    )
    .optional(),
  session_duration_mins: z.number().int().min(15).max(120).default(45),
  session_fee: z.coerce.number().min(0).optional(),
});

export const listSlotsQuerySchema = z.object({
  from_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const listSessionsQuerySchema = z.object({
  date: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
      .optional(),
  ),
  status: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.enum(["booked", "completed", "cancelled"]).optional(),
  ),
  search: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().trim().min(1).max(100).optional(),
  ),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const listAvailableSlotsQuerySchema = z.object({
  counsellor_id: z.string().min(1).optional(),
  from_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
    .optional(),
  to_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Student: book a session
export const bookSessionSchema = z.object({
  availability_id: z.string().min(1),
  session_mode: z.enum(["voice_call", "video_call"]),
  session_type: z.enum(["career", "academic", "personal", "mental_health"]),
  booking_reason: z.string().min(1, "Booking reason is required").max(500),
  session_fee: z.coerce.number().min(0).optional(),
});

// Student: reschedule
export const rescheduleSessionSchema = z.object({
  new_availability_id: z.string().min(1),
  reason: z.string().max(500).optional(),
});

// Student/Counsellor: cancel
export const cancelSessionSchema = z.object({
  cancellation_reason: z.string().max(500).optional(),
});

export const updateMeetingSchema = z.object({
  meeting_url: z.string().url().optional(),
  meeting_id: z.string().max(50).optional(),
});

export const completeSessionSchema = z.object({
  session_notes: z.string().max(5000).optional(),
});

export const sessionIdParamsSchema = z.object({
  id: z.string().min(1),
});

export type AddSlotInput = z.infer<typeof addSlotSchema>;
export type ListSlotsQueryInput = z.infer<typeof listSlotsQuerySchema>;
export type ListSessionsQueryInput = z.infer<typeof listSessionsQuerySchema>;
export type ListAvailableSlotsQueryInput = z.infer<
  typeof listAvailableSlotsQuerySchema
>;
export type BookSessionInput = z.infer<typeof bookSessionSchema>;
export type RescheduleSessionInput = z.infer<typeof rescheduleSessionSchema>;
export type CancelSessionInput = z.infer<typeof cancelSessionSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
export type CompleteSessionInput = z.infer<typeof completeSessionSchema>;

export const rateSessionSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  rating_feedback: z.string().max(1000).optional(),
});

export type RateSessionInput = z.infer<typeof rateSessionSchema>;
