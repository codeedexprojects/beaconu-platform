import { z } from "zod";

export const platformAdminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type PlatformAdminLoginInput = z.infer<typeof platformAdminLoginSchema>;
