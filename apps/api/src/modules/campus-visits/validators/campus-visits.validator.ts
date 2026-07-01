import { z } from "zod";

const guestSchema = z.object({
  name: z.string().min(1, "Guest name is required"),
  relation: z.string().min(1, "Relation is required"),
});

export const createCampusVisitSchema = z.object({
  college_id: z.string().min(1, "College is required"),
  ambassador_id: z.string().optional(),
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  course_interest: z.string().optional(),
  additional_visitors_count: z.coerce.number().int().min(0).default(0),
  guests: z.array(guestSchema).optional(),
  reason_for_visit: z.string().min(1, "Reason for visit is required"),
  proposed_date: z.string().date("Valid date is required (YYYY-MM-DD)"),
  proposed_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Valid time is required (HH:MM)"),
});

export const rescheduleCampusVisitSchema = z.object({
  proposed_date: z.string().date("Valid date is required (YYYY-MM-DD)"),
  proposed_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Valid time is required (HH:MM)"),
});

export const cancelCampusVisitSchema = z.object({
  cancellation_reason: z.string().min(1, "Cancellation reason is required"),
});

export const rejectCampusVisitSchema = z.object({
  rejection_reason: z.string().min(1, "Rejection reason is required"),
});

export const reassignCampusVisitSchema = z.object({
  ambassador_id: z.string().min(1, "Ambassador is required"),
  reassignment_reason: z.string().optional(),
});

export const campusVisitListQuerySchema = z.object({
  status: z
    .enum([
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "reassigned",
      "rejected",
    ])
    .optional(),
  date: z.string().date().optional(),
  ambassador_id: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateCampusVisitInput = z.infer<typeof createCampusVisitSchema>;
export type RescheduleCampusVisitInput = z.infer<
  typeof rescheduleCampusVisitSchema
>;
export type CancelCampusVisitInput = z.infer<typeof cancelCampusVisitSchema>;
export type RejectCampusVisitInput = z.infer<typeof rejectCampusVisitSchema>;
export type ReassignCampusVisitInput = z.infer<
  typeof reassignCampusVisitSchema
>;
export type CampusVisitListQuery = z.infer<typeof campusVisitListQuerySchema>;
