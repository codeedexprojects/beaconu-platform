import { z } from "zod";

export const requestSeatCancellationSchema = z.object({
  application_course_id: z
    .string()
    .trim()
    .min(1, "application_course_id is required"),
  reason: z.string().trim().min(1, "Reason is required").max(1000),
  supporting_doc_urls: z.array(z.string().trim().url()).max(5).optional(),
});

export const reviewSeatCancellationSchema = z
  .object({
    decision: z.enum(["approve", "reject"]),
    remarks: z.string().trim().max(1000).optional(),
    refund_amount: z.number().nonnegative().optional(),
    refund_status: z
      .enum(["not_applicable", "pending", "processed", "denied"])
      .optional(),
  })
  .refine((data) => data.decision !== "reject" || !!data.remarks, {
    message: "Remarks are required when rejecting a request",
    path: ["remarks"],
  });

export const listSeatCancellationsQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type RequestSeatCancellationInput = z.infer<
  typeof requestSeatCancellationSchema
>;
export type ReviewSeatCancellationInput = z.infer<
  typeof reviewSeatCancellationSchema
>;
export type ListSeatCancellationsQuery = z.infer<
  typeof listSeatCancellationsQuerySchema
>;

// --- Phase-based case flow ---

export const submitInitiationSchema = z.object({
  effective_date: z.coerce.date(),
  last_semester: z.string().trim().min(1).max(50),
});

export const scheduleCounselingSchema = z.object({
  counselor_id: z.string().trim().min(1, "counselor_id is required"),
  scheduled_at: z.coerce.date(),
});

export const submitCounselingOutcomeSchema = z.object({
  notes: z.string().trim().max(2000).optional(),
  outcome: z.enum(["transfer", "termination"]),
});

export const submitSettlementSchema = z
  .object({
    case_type: z.enum(["A", "B", "C"]),
    penalty_amount: z.number().nonnegative().optional(),
    refund_calculation_method: z.enum(["percentage", "fixed"]).optional(),
    refund_calculation_value: z.number().nonnegative().optional(),
  })
  .refine(
    (data) => data.case_type !== "A" || data.penalty_amount !== undefined,
    {
      message: "penalty_amount is required for Case A",
      path: ["penalty_amount"],
    },
  )
  .refine(
    (data) =>
      data.case_type !== "B" ||
      (data.refund_calculation_method &&
        data.refund_calculation_value !== undefined),
    {
      message:
        "refund_calculation_method and refund_calculation_value are required for Case B",
      path: ["refund_calculation_value"],
    },
  );

export const finalClearanceSchema = z.object({
  refund_transaction_ref: z.string().trim().max(100).optional(),
  refund_payment_method: z.string().trim().max(100).optional(),
});

export type SubmitInitiationInput = z.infer<typeof submitInitiationSchema>;
export type ScheduleCounselingInput = z.infer<typeof scheduleCounselingSchema>;
export type SubmitCounselingOutcomeInput = z.infer<
  typeof submitCounselingOutcomeSchema
>;
export type SubmitSettlementInput = z.infer<typeof submitSettlementSchema>;
export type FinalClearanceInput = z.infer<typeof finalClearanceSchema>;
