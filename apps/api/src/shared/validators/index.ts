import { z } from "zod";

export const commonSchemas = {
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
};
