import { z } from "zod";

export const collegeIdQuerySchema = z.object({
  college_id: z.string().trim().min(1, "college_id is required"),
});

export const setupCommuteSchema = z.object({
  college_id: z.string().trim().min(1, "college_id is required"),
  route_id: z.string().trim().min(1, "route_id is required"),
  pickup_stop_id: z.string().trim().min(1, "pickup_stop_id is required"),
  bus_id: z.string().trim().min(1, "bus_id is required"),
});

export const scheduleQuerySchema = z.object({
  college_id: z.string().trim().min(1, "college_id is required"),
  period: z.enum(["morning", "evening"]),
});

export const rideHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const commutePaymentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CollegeIdQuery = z.infer<typeof collegeIdQuerySchema>;
export type SetupCommuteBody = z.infer<typeof setupCommuteSchema>;
export type ScheduleQuery = z.infer<typeof scheduleQuerySchema>;
export type RideHistoryQuery = z.infer<typeof rideHistoryQuerySchema>;
export type CommutePaymentsQuery = z.infer<typeof commutePaymentsQuerySchema>;
