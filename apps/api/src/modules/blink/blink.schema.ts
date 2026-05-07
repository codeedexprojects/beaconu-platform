import { z } from 'zod';
import { commonSchemas } from '@/shared/validators';

export const blinkSchemas = {
  register: z.object({
    agency_reg_number: z.string().min(1),
    agency_name: z.string().min(1),
    agency_email: commonSchemas.email,
    agency_phone_no: commonSchemas.phoneNumber,
    country: z.string().min(1),
    password: commonSchemas.password,
    confirm_password: commonSchemas.password,
  }).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  }),

  login: z.object({
    agency_reg_number: z.string().min(1),
    agency_email: commonSchemas.email,
    password: z.string().min(1),
  }),
};
