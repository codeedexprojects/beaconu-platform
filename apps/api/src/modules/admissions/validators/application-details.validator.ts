import { z } from "zod";

export const personalDetailsSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(255),
  date_of_birth: z.coerce.date(),
  gender: z.enum(["male", "female", "other"]),
  category: z.string().trim().max(30).optional().nullable(),
  blood_group: z.string().trim().max(5).optional().nullable(),
  religion: z.string().trim().max(50).optional().nullable(),
  mother_tongue: z.string().trim().max(50).optional().nullable(),
  marital_status: z.string().trim().max(20).optional().nullable(),
  aadhar_number: z.string().trim().max(20).optional().nullable(),
  profile_photo_url: z.string().trim().url().optional().nullable(),
  whatsapp_country_code: z.string().trim().max(5).optional(),
  whatsapp_number: z.string().trim().max(15).optional().nullable(),
});

export const familyDetailsSchema = z.object({
  father_name: z.string().trim().min(1, "Father's name is required").max(255),
  father_occupation: z.string().trim().max(100).optional().nullable(),
  father_phone: z.string().trim().max(15).optional().nullable(),
  father_email: z.string().trim().email().optional().nullable(),
  mother_name: z.string().trim().min(1, "Mother's name is required").max(255),
  mother_occupation: z.string().trim().max(100).optional().nullable(),
  mother_phone: z.string().trim().max(15).optional().nullable(),
  mother_email: z.string().trim().email().optional().nullable(),
  guardian_name: z.string().trim().max(255).optional().nullable(),
  guardian_relation: z.string().trim().max(50).optional().nullable(),
  guardian_phone: z.string().trim().max(15).optional().nullable(),
  annual_family_income: z.number().min(0).optional().nullable(),
  number_of_siblings: z.number().int().min(0).optional().nullable(),
});

const addressSchema = z.object({
  address_line1: z.string().trim().min(1, "Address is required").max(255),
  address_line2: z.string().trim().max(255).optional().nullable(),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  district: z.string().trim().max(100).optional().nullable(),
  pin_code: z.string().trim().min(1, "PIN code is required").max(10),
  country: z.string().trim().min(1, "Country is required").max(100),
});

export const addressDetailsSchema = z
  .object({
    permanent: addressSchema,
    same_as_permanent: z.boolean(),
    current: addressSchema.optional().nullable(),
  })
  .refine((data) => data.same_as_permanent || data.current, {
    message:
      "Current address is required when it differs from the permanent address",
    path: ["current"],
  });

const qualificationEntrySchema = z.object({
  level: z.string().trim().min(1, "Qualification level is required").max(50),
  board_or_university: z.string().trim().min(1).max(255),
  institution_name: z.string().trim().min(1).max(255),
  year_of_passing: z.number().int().min(1950).max(2100),
  percentage_or_cgpa: z.number().min(0).max(100),
  subjects: z.string().trim().max(500).optional().nullable(),
});

export const qualificationDetailsSchema = z.object({
  qualifications: z
    .array(qualificationEntrySchema)
    .min(1, "At least one qualification is required"),
});

export type PersonalDetailsInput = z.infer<typeof personalDetailsSchema>;
export type FamilyDetailsInput = z.infer<typeof familyDetailsSchema>;
export type AddressDetailsInput = z.infer<typeof addressDetailsSchema>;
export type QualificationDetailsInput = z.infer<
  typeof qualificationDetailsSchema
>;
