import { z } from "zod";

export const idSchema = z.string().min(1);
export const uuidSchema = idSchema;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const phoneNumberSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number");

export const emailSchema = z.string().email("Must be a valid email address");
