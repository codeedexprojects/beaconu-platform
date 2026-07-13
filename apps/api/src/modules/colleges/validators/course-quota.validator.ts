import { z } from "zod";

export const FEE_REDUCTION_TYPES = ["flat", "percentage"] as const;

const feeReductionRefinement = (
  data: {
    appFeeReductionType?: string | null;
    appFeeReductionValue?: number | null;
  },
  ctx: z.RefinementCtx,
) => {
  const hasType = data.appFeeReductionType != null;
  const hasValue = data.appFeeReductionValue != null;

  if (hasType !== hasValue) {
    ctx.addIssue({
      code: "custom",
      message:
        "appFeeReductionType and appFeeReductionValue must be set together, or both left empty",
      path: ["appFeeReductionValue"],
    });
    return;
  }

  if (
    hasValue &&
    data.appFeeReductionType === "percentage" &&
    (data.appFeeReductionValue! < 0 || data.appFeeReductionValue! > 100)
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Percentage reduction must be between 0 and 100",
      path: ["appFeeReductionValue"],
    });
  }

  if (hasValue && data.appFeeReductionValue! < 0) {
    ctx.addIssue({
      code: "custom",
      message: "Reduction value cannot be negative",
      path: ["appFeeReductionValue"],
    });
  }
};

export const attachCourseQuotaSchema = z
  .object({
    collegeQuotaId: z.string().min(1, "collegeQuotaId is required"),
    appFeeReductionType: z.enum(FEE_REDUCTION_TYPES).optional().nullable(),
    appFeeReductionValue: z.number().optional().nullable(),
    tuitionFeeOverride: z.number().min(0).optional().nullable(),
  })
  .superRefine(feeReductionRefinement);

export type AttachCourseQuotaInput = z.infer<typeof attachCourseQuotaSchema>;

export const updateCourseQuotaSchema = z
  .object({
    appFeeReductionType: z.enum(FEE_REDUCTION_TYPES).optional().nullable(),
    appFeeReductionValue: z.number().optional().nullable(),
    tuitionFeeOverride: z.number().min(0).optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Only enforce the paired-fields rule when the caller is touching either field.
    if (
      data.appFeeReductionType === undefined &&
      data.appFeeReductionValue === undefined
    ) {
      return;
    }
    feeReductionRefinement(data, ctx);
  });

export type UpdateCourseQuotaInput = z.infer<typeof updateCourseQuotaSchema>;

export const courseQuotaParamSchema = z.object({
  id: z.string().min(1, "Course ID is required"),
  courseQuotaId: z.string().min(1, "Course quota ID is required"),
});

export const courseIdOnlyParamSchema = z.object({
  id: z.string().min(1, "Course ID is required"),
});
