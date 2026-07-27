import { z } from "zod";

export const startApplicationSchema = z.object({
  nationality: z.string().trim().min(1, "Nationality is required").max(100),
  // The primary course — required at start, since payment (and everything
  // after it) is gated on this selection. Its quota is set afterward via
  // Change Application Course Quota, same as every other course — never
  // at Start.
  course_id: z.string().trim().min(1, "Course is required"),
  campus_id: z.string().trim().optional().nullable(),
  state_of_domicile: z.string().trim().max(100).optional().nullable(),
  passport_country: z.string().trim().max(100).optional().nullable(),
  passport_number: z.string().trim().max(50).optional().nullable(),
});

export const applicationCycleParamSchema = z.object({
  id: z.string().min(1, "Application form ID is required"),
});

// Each detail step is its own page on the client — the form-details GET
// returns only the one section asked for, not all four at once.
export const getFormDetailsQuerySchema = z.object({
  section: z.enum([
    "personal_details",
    "family_details",
    "address_details",
    "qualification_details",
  ]),
});

// Optional college filter for the no-cycle-id status API — narrows to one
// college (which may run several concurrent cycles) without requiring a
// specific admissionCycleId.
export const getStatusAllCyclesQuerySchema = z.object({
  college_id: z.string().trim().min(1).optional(),
});

export type StartApplicationInput = z.infer<typeof startApplicationSchema>;
export type GetFormDetailsQuery = z.infer<typeof getFormDetailsQuerySchema>;
export type GetStatusAllCyclesQuery = z.infer<
  typeof getStatusAllCyclesQuerySchema
>;
