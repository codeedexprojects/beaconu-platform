import { z } from "zod";

export const counsellorRequestSchemas = {
  submit: z
    .object({
      full_name: z.string().trim().min(1).max(255),
      email: z
        .string()
        .trim()
        .email()
        .max(255)
        .transform((v) => v.toLowerCase()),
      phone_number: z.string().trim().min(10).max(20),
      gender: z.enum(["male", "female", "non_binary", "prefer_not_to_say"]),
      city: z.string().trim().min(1).max(100),
      counsellor_type: z.enum(["academic", "mindcare"]),
      qualification: z.string().trim().min(1).max(255),
      years_of_experience: z.string().trim().min(1).max(50),
      known_languages: z.string().trim().min(1).max(255),
      specialization: z.string().trim().min(1),
      license_number: z.string().trim().max(100).optional(),
      message: z.string().trim().min(20),
      password: z.string().min(8),
      confirm_password: z.string().min(1),
    })
    .refine((d) => d.password === d.confirm_password, {
      message: "Passwords don't match",
      path: ["confirm_password"],
    }),

  updateStatus: z.object({
    status: z.enum(["approved", "rejected"]),
    review_remarks: z.string().trim().optional(),
  }),

  list: z.object({
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    counsellor_type: z.enum(["academic", "mindcare"]).optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
};

export type SubmitCounsellorRequestData = z.infer<
  typeof counsellorRequestSchemas.submit
>;
export type UpdateCounsellorRequestStatusData = z.infer<
  typeof counsellorRequestSchemas.updateStatus
>;
export type ListCounsellorRequestsData = z.infer<
  typeof counsellorRequestSchemas.list
>;
