import { z } from "zod";

const VISIT_OPEN_HOUR = 9; // 09:00
const VISIT_CLOSE_HOUR = 17; // 17:00 — no slots at or after this
const MAX_ADVANCE_DAYS = 90;
const MIN_ADVANCE_HOURS = 2;

const guestSchema = z.object({
  name: z.string().min(1, "Guest name is required"),
  relation: z.string().min(1, "Relation is required"),
});

function todayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function maxDateUtc(): Date {
  const d = todayUtc();
  d.setUTCDate(d.getUTCDate() + MAX_ADVANCE_DAYS);
  return d;
}

// Validates proposed_date + proposed_time together on a Zod object that has both fields.
function refineDateAndTime<
  T extends { proposed_date: string; proposed_time: string },
>(val: T, ctx: z.RefinementCtx) {
  const today = todayUtc();
  const visitDate = new Date(val.proposed_date + "T00:00:00Z");

  if (isNaN(visitDate.getTime())) return; // already caught by z.string().date()

  if (visitDate < today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["proposed_date"],
      message: "Visit date cannot be in the past",
    });
    return;
  }

  if (visitDate > maxDateUtc()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["proposed_date"],
      message: `Visit date cannot be more than ${MAX_ADVANCE_DAYS} days in the future`,
    });
    return;
  }

  const [hhStr, mmStr] = val.proposed_time.split(":");
  const hh = parseInt(hhStr, 10);
  const mm = parseInt(mmStr, 10);

  if (isNaN(hh) || isNaN(mm)) return; // already caught by regex

  if (hh < VISIT_OPEN_HOUR || hh >= VISIT_CLOSE_HOUR) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["proposed_time"],
      message: `Visit time must be between ${VISIT_OPEN_HOUR}:00 and ${VISIT_CLOSE_HOUR}:00`,
    });
    return;
  }

  // If booking for today, require at least MIN_ADVANCE_HOURS from now
  const isToday = visitDate.getTime() === today.getTime();
  if (isToday) {
    const now = new Date();
    const visitUtcMs = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hh,
      mm,
    );
    const minAllowedMs = Date.now() + MIN_ADVANCE_HOURS * 60 * 60 * 1000;
    if (visitUtcMs < minAllowedMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["proposed_time"],
        message: `Same-day visits must be booked at least ${MIN_ADVANCE_HOURS} hours in advance`,
      });
    }
  }
}

const dateTimeFields = {
  proposed_date: z.string().date("Valid date is required (YYYY-MM-DD)"),
  proposed_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Valid time is required (HH:MM)"),
};

export const createCampusVisitSchema = z
  .object({
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
    guests: z
      .array(guestSchema)
      .max(10, "Maximum 10 guests allowed")
      .optional(),
    reason_for_visit: z
      .string()
      .min(10, "Please provide a more detailed reason (at least 10 characters)")
      .max(500, "Reason must be under 500 characters"),
    ...dateTimeFields,
  })
  .superRefine(refineDateAndTime);

export const rescheduleCampusVisitSchema = z
  .object(dateTimeFields)
  .superRefine(refineDateAndTime);

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
