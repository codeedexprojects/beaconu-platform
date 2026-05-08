import { z } from 'zod';

export const counsellorSchemas = {
  updateMyProfile: z.object({
    full_name: z.string().trim().min(1).optional(),
    phone_number: z.string().trim().optional(),
    avatar_url: z.string().url().optional(),
  }),

  updateStatus: z.object({
    status: z.enum(['active', 'inactive', 'pending_verification']),
  }),
};

export type UpdateMyProfileData = z.infer<typeof counsellorSchemas.updateMyProfile>;
export type UpdateCounsellorStatusData = z.infer<typeof counsellorSchemas.updateStatus>;
