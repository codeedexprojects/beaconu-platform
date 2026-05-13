import { z } from "zod";

export const collegeOnboardingSchemas = {
  submit: z.object({
    college_name: z.string().trim().min(1).max(255),
    university_name: z.string().trim().max(255).optional(),
    contact_person_name: z.string().trim().min(1).max(255),
    contact_email: z.string().trim().email().max(255),
    contact_phone: z.string().trim().max(20).optional(),
    city: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    message: z.string().trim().optional(),
  }),

  updateStatus: z.object({
    status: z.enum(["pending", "approved", "rejected"]),
    review_remarks: z.string().trim().optional(),
  }),

  list: z.object({
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
};

export type SubmitCollegeOnboardingData = z.infer<
  typeof collegeOnboardingSchemas.submit
>;
export type UpdateOnboardingStatusData = z.infer<
  typeof collegeOnboardingSchemas.updateStatus
>;
export type ListOnboardingRequestsData = z.infer<
  typeof collegeOnboardingSchemas.list
>;
