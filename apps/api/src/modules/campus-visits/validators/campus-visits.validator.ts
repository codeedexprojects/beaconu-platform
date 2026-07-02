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
  phone_number: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\+?[\d\s\-().]+$/, "Invalid phone number format"),
  course_interest: z.string().optional(),
  additional_visitors_count: z.coerce
    .number()
    .int()
    .min(0)
    .max(10, "Maximum 10 additional visitors allowed")
    .default(0),
  guests: z.array(guestSchema).max(10, "Maximum 10 guests allowed").optional(),
  reason_for_visit: z
    .string()
    .min(10, "Please provide a more detailed reason (at least 10 characters)")
    .max(500, "Reason must be under 500 characters"),
  proposed_date: z.string().date("Valid date is required (YYYY-MM-DD)"),
});

export const rescheduleCampusVisitSchema = z.object({
  proposed_date: z.string().date("Valid date is required (YYYY-MM-DD)"),
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
  college_id: z.string().optional(),
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
