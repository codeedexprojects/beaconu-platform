import { z } from "zod";

export const FEE_ADJUSTMENT_TYPES = ["flat", "percentage"] as const;

const feeAdjustmentRefinement = (
  data: {
    appFeeAdjustmentType?: string | null;
    appFeeAdjustmentValue?: number | null;
  },
  ctx: z.RefinementCtx,
) => {
  const hasType = data.appFeeAdjustmentType != null;
  const hasValue = data.appFeeAdjustmentValue != null;

  if (hasType !== hasValue) {
    ctx.addIssue({
      code: "custom",
      message:
        "appFeeAdjustmentType and appFeeAdjustmentValue must be set together, or both left empty",
      path: ["appFeeAdjustmentValue"],
    });
    return;
  }

  if (
    hasValue &&
    data.appFeeAdjustmentType === "percentage" &&
    (data.appFeeAdjustmentValue! < -100 || data.appFeeAdjustmentValue! > 100)
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Percentage adjustment must be between -100 and 100",
      path: ["appFeeAdjustmentValue"],
    });
  }
};

export const attachCourseQuotaSchema = z
  .object({
    collegeQuotaId: z.string().min(1, "collegeQuotaId is required"),
    appFeeAdjustmentType: z.enum(FEE_ADJUSTMENT_TYPES).optional().nullable(),
    appFeeAdjustmentValue: z.number().optional().nullable(),
    tuitionFeeOverride: z.number().min(0).optional().nullable(),
  })
  .superRefine(feeAdjustmentRefinement);

export type AttachCourseQuotaInput = z.infer<typeof attachCourseQuotaSchema>;

export const updateCourseQuotaSchema = z
  .object({
    appFeeAdjustmentType: z.enum(FEE_ADJUSTMENT_TYPES).optional().nullable(),
    appFeeAdjustmentValue: z.number().optional().nullable(),
    tuitionFeeOverride: z.number().min(0).optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.appFeeAdjustmentType === undefined &&
      data.appFeeAdjustmentValue === undefined
    ) {
      return;
    }
    feeAdjustmentRefinement(data, ctx);
  });

export type UpdateCourseQuotaInput = z.infer<typeof updateCourseQuotaSchema>;

export const courseQuotaParamSchema = z.object({
  id: z.string().min(1, "Course ID is required"),
  courseQuotaId: z.string().min(1, "Course quota ID is required"),
});

export const courseIdOnlyParamSchema = z.object({
  id: z.string().min(1, "Course ID is required"),
});
