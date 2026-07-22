import { z } from "zod";

export const upsertAvailabilitySchema = z
  .object({
    weekday: z.coerce.number().int().min(0).max(6),
    time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Valid time is required (HH:MM)")
      .optional(),
    max_capacity: z.coerce.number().int().min(1).default(1),
    is_off: z.coerce.boolean().default(false),
  })
  .superRefine((val, ctx) => {
    if (!val.is_off && !val.time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["time"],
        message: "Time is required for a weekday that is open for visits",
      });
    }
  });

export const studentAvailabilityQuerySchema = z.object({
  college_id: z.string().min(1, "College is required"),
});

export type UpsertAvailabilityInput = z.infer<typeof upsertAvailabilitySchema>;
export type StudentAvailabilityQuery = z.infer<
  typeof studentAvailabilityQuerySchema
>;
