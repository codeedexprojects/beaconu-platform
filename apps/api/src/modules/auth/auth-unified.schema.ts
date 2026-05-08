import { z } from 'zod';

export const unifiedAuthSchemas = {
  login: z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6),
  }),
  registerCounsellor: z.object({
    full_name: z.string().trim().min(1),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6),
    confirm_password: z.string().min(6),
    phone_number: z.string().trim().optional(),
    counsellor_type: z.enum(['academic', 'mindcare']),
  }).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  }),
};

export type UnifiedLoginData = z.infer<typeof unifiedAuthSchemas.login>;
export type RegisterCounsellorData = z.infer<typeof unifiedAuthSchemas.registerCounsellor>;
