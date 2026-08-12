import { z } from "zod";

export const requestCourseSwitchSchema = z.object({
  to_course_id: z.string().trim().min(1, "to_course_id is required"),
  reason: z.string().trim().min(1, "Reason is required").max(1000),
  supporting_doc_urls: z.array(z.string().trim().url()).max(5).optional(),
});

export const reviewCourseSwitchSchema = z
  .object({
    decision: z.enum(["approve", "reject"]),
    remarks: z.string().trim().max(1000).optional(),
  })
  .refine((data) => data.decision !== "reject" || !!data.remarks, {
    message: "Remarks are required when rejecting a request",
    path: ["remarks"],
  });

export const listCourseSwitchRequestsQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type RequestCourseSwitchInput = z.infer<
  typeof requestCourseSwitchSchema
>;
export type ReviewCourseSwitchInput = z.infer<typeof reviewCourseSwitchSchema>;
export type ListCourseSwitchRequestsQuery = z.infer<
  typeof listCourseSwitchRequestsQuerySchema
>;
