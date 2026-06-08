import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().trim().optional(),
  cover_image_url: z.string().url().optional(),
  category: z.string().trim().min(1, "Category is required").max(30),
  speaker_name: z.string().trim().max(255).optional(),
  speaker_title: z.string().trim().max(255).optional(),
  organizer: z.string().trim().max(255).optional(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "HH:MM")
    .optional(),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "HH:MM")
    .optional(),
  duration: z.string().trim().max(50).optional(),
  event_mode: z.enum(["online", "offline", "hybrid"]),
  venue: z.string().trim().max(255).optional(),
  online_link: z.string().url().optional(),
  is_free: z.boolean().default(true),
  ticket_price: z.coerce.number().min(0).default(0),
  total_seats: z.coerce.number().int().min(1).optional(),
  college_id: z.string().trim().optional(),
  status: z
    .enum(["draft", "published", "cancelled", "completed", "archived"])
    .optional(),
  has_recording: z.boolean().optional(),
  recording_url: z.string().url().optional(),
  recording_duration: z.string().trim().max(20).optional(),
  recorded_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
    .optional(),
});

export const updateEventSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().optional(),
  cover_image_url: z.string().url().optional().nullable(),
  category: z.string().trim().min(1).max(30).optional(),
  speaker_name: z.string().trim().max(255).optional().nullable(),
  speaker_title: z.string().trim().max(255).optional().nullable(),
  organizer: z.string().trim().max(255).optional().nullable(),
  event_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
    .optional(),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "HH:MM")
    .optional()
    .nullable(),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "HH:MM")
    .optional()
    .nullable(),
  duration: z.string().trim().max(50).optional().nullable(),
  event_mode: z.enum(["online", "offline", "hybrid"]).optional(),
  venue: z.string().trim().max(255).optional().nullable(),
  online_link: z.string().url().optional().nullable(),
  is_free: z.boolean().optional(),
  ticket_price: z.coerce.number().min(0).optional(),
  total_seats: z.coerce.number().int().min(1).optional().nullable(),
});

export const updateEventStatusSchema = z.object({
  status: z.enum(["draft", "published", "cancelled", "completed", "archived"]),
});

export const uploadRecordingSchema = z.object({
  recording_url: z.string().url("Valid recording URL required"),
  is_youtube_video: z.boolean().optional(),
  recording_duration: z.string().trim().max(20).optional(),
  recorded_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
    .optional(),
});

export const registerEventSchema = z
  .object({
    paid_amount: z.coerce.number().min(0).optional(),
    transaction_id: z.string().trim().min(1).max(255).optional(),
  })
  .default({});

export const eventIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const eventSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const listEventsQuerySchema = z.object({
  status: z.string().optional(),
  category: z.string().optional(),
  event_mode: z.string().optional(),
  search: z.string().optional(),
  is_free: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  has_recording: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  from_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const listUpcomingEventsQuerySchema = z.object({
  category: z.string().optional(),
  event_mode: z.enum(["online", "offline", "hybrid"]).optional(),
  search: z.string().trim().min(1).max(255).optional(),
  is_free: z
    .union([z.boolean(), z.string()])
    .transform((v) => (typeof v === "boolean" ? v : v === "true"))
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const listMyRegistrationsQuerySchema = z.object({
  status: z.enum(["registered", "cancelled"]).optional(),
  search: z.string().trim().min(1).max(255).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const listMyRecordingsQuerySchema = z.object({
  search: z.string().trim().min(1).max(255).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type UpdateEventStatusInput = z.infer<typeof updateEventStatusSchema>;
export type UploadRecordingInput = z.infer<typeof uploadRecordingSchema>;
export type RegisterEventInput = z.infer<typeof registerEventSchema>;
export type ListEventsQueryInput = z.infer<typeof listEventsQuerySchema>;
export type ListUpcomingEventsQueryInput = z.infer<
  typeof listUpcomingEventsQuerySchema
>;
export type ListMyRegistrationsQueryInput = z.infer<
  typeof listMyRegistrationsQuerySchema
>;
export type ListMyRecordingsQueryInput = z.infer<
  typeof listMyRecordingsQuerySchema
>;
