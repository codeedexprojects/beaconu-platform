import { z } from 'zod';
import { commonSchemas } from '@/shared/validators';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const blinkSchemas = {
  registerAssociateAdmin: z.object({
    full_name: z.string().min(1),
    email: commonSchemas.email,
    phone_number: z.string().optional(),
    country: z.string().optional(),
    agency_name: z.string().min(1),
    agency_reg_number: z.string().min(1),
    password: commonSchemas.password,
    confirm_password: commonSchemas.password,
  }).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  }),

  registerAssociateEmployee: z.object({
    full_name: z.string().min(1),
    email: commonSchemas.email,
    phone_number: z.string().optional(),
    associate_parent_id: z.string().trim().refine((value) => {
      if (value.includes('{{') || value.includes('}}')) {
        return false;
      }
      return uuidRegex.test(value);
    }, {
      message: 'Invalid UUID. Run Register Associate Admin first so associateAdminId is set.',
    }),
    password: commonSchemas.password,
    confirm_password: commonSchemas.password,
  }).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  }),

  registerCampusAmbassador: z.object({
    full_name: z.string().min(1),
    email: commonSchemas.email,
    phone_number: z.string().optional(),
    college_id: z.string().uuid(),
    linked_student_id: z.string().uuid().optional(),
    ambassador_type: z.enum(['student', 'teacher']),
    password: commonSchemas.password,
    confirm_password: commonSchemas.password,
  }).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  }),

  updateEmployeeStatus: z.object({
    status: z.enum(['active', 'inactive', 'suspended', 'rejected']),
  }),

  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1),
  }),
};
