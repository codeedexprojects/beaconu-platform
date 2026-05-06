import { z } from 'zod'

export const blinkRegisterSchema = z.object({
  agency_reg_number: z.string().min(1, 'Agency registration number is required'),
  agency_name: z.string().min(1, 'Agency name is required'),
  agency_email: z.string().email('Invalid email address'),
  agency_phone_no: z.string().min(10, 'Phone number must be at least 10 digits'),
  country: z.string().min(1, 'Country is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

export const blinkLoginSchema = z.object({
  agency_reg_number: z.string().optional(),
  agency_email: z.string().email('Invalid email address').optional(),
  password: z.string().min(1, 'Password is required'),
}).refine(data => data.agency_reg_number || data.agency_email, {
  message: "Either agency registration number or email is required",
  path: ["agency_reg_number"],
})

export type BlinkRegisterInput = z.infer<typeof blinkRegisterSchema>
export type BlinkLoginInput = z.infer<typeof blinkLoginSchema>
