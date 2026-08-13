import { z } from "zod";

export const declarationSchema = z.object({
  accepted: z.boolean().refine((v) => v === true, {
    message: "You must accept the declaration to proceed",
  }),
  // Legacy field — the redesigned Declaration screen replaced the typed
  // full-name confirmation with an uploaded signature + place/date, so
  // this is no longer collected by the client but stays optional so old
  // draft data (and any caller still sending it) keeps working.
  full_name_confirmation: z.string().trim().optional().nullable(),
  signature_url: z.string().trim().url("Signature upload is required"),
  place: z.string().trim().min(1, "Place is required").max(100),
  date: z.coerce.date(),
});

export type DeclarationInput = z.infer<typeof declarationSchema>;
