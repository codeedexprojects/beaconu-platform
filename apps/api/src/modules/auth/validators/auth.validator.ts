import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
});

export const platformLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
  role_slug: z.string().trim().toLowerCase().min(1),
});

export const registerCounsellorSchema = z
  .object({
    full_name: z.string().trim().min(1),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6),
    confirm_password: z.string().min(6),
    phone_number: z.string().trim().optional(),
    counsellor_type: z.enum(["academic", "mindcare"]),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type PlatformLoginInput = z.infer<typeof platformLoginSchema>;
export type RegisterCounsellorInput = z.infer<typeof registerCounsellorSchema>;
