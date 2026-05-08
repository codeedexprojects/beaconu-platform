import { z } from 'zod';

export const platformAuthSchemas = {
  login: z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6),
    role_slug: z.string().trim().toLowerCase().min(1),
  }),
};

export type PlatformAdminLoginData = z.infer<typeof platformAuthSchemas.login>;
