import { z } from "zod";

export const declarationSchema = z.object({
  accepted: z.boolean().refine((v) => v === true, {
    message: "You must accept the declaration to proceed",
  }),
  full_name_confirmation: z
    .string()
    .trim()
    .min(1, "Please type your full name to confirm"),
});

export type DeclarationInput = z.infer<typeof declarationSchema>;
