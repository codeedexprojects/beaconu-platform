import { z } from 'zod';

export const platformAuthSchemas = {
  login: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
};

export type PlatformAdminLoginData = z.infer<typeof platformAuthSchemas.login>;
