import { z } from "zod";

export const publicHostelListParamSchema = z.object({
  slug: z.string().min(1, "College slug is required"),
});

export const publicHostelDetailParamSchema = z.object({
  slug: z.string().min(1, "College slug is required"),
  hostelId: z.string().min(1, "Hostel ID is required"),
});

export const updateHostelSchema = z.object({
  description: z.string().trim().optional().nullable(),
  totalBeds: z.number().int().positive().optional().nullable(),
  coverImageUrl: z.string().trim().url().optional().nullable(),
  wardenInfo: z
    .object({
      name: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      whatsapp: z.string().trim().optional(),
      email: z.string().trim().email().optional(),
    })
    .optional(),
  amenities: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        icon: z.string().trim().optional(),
      }),
    )
    .optional(),
  rules: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        description: z.string().trim().min(1),
      }),
    )
    .optional(),
  locationInfo: z
    .object({
      address: z.string().trim().optional(),
      nearbyEssentials: z
        .array(
          z.object({
            type: z.string().trim().min(1),
            name: z.string().trim().min(1),
            distance: z.string().trim().min(1),
          }),
        )
        .optional(),
    })
    .optional(),
});

export const roomTypeSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().optional().nullable(),
  totalBeds: z.number().int().positive(),
  availableBeds: z.number().int().nonnegative().optional(),
  annualPlanPrice: z.number().nonnegative().optional(),
  monthlyPlanPrice: z.number().nonnegative().optional(),
  admissionFee: z.number().nonnegative().optional(),
  securityDeposit: z.number().nonnegative().optional(),
});

export const messPlanSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().optional().nullable(),
  mealsIncluded: z.array(z.string().trim().min(1)).default([]),
  priceMonthly: z.number().positive(),
  duration: z.string().trim().default("1 Month"),
  isCompulsory: z.boolean().default(false),
  dietaryOptions: z.array(z.string().trim().min(1)).default([]),
});

export const addonServiceSchema = z.object({
  serviceType: z.string().trim().min(2).max(30),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().optional().nullable(),
  isOptional: z.boolean().default(true),
  plans: z
    .array(
      z.object({
        label: z.string().trim().min(1),
        price: z.number().nonnegative(),
      }),
    )
    .default([]),
  notes: z.string().trim().optional().nullable(),
});

export const createHostelSchema = z.object({
  name: z.string().trim().min(2).max(255),
  hostelType: z.enum(["boys", "girls", "co-ed"]),
  isOnCampus: z.boolean().default(true),
  distanceFromCampus: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  totalBeds: z.number().int().positive().optional().nullable(),
  coverImageUrl: z.string().trim().url().optional().nullable(),
  wardenInfo: updateHostelSchema.shape.wardenInfo,
  amenities: updateHostelSchema.shape.amenities,
  rules: updateHostelSchema.shape.rules,
  locationInfo: updateHostelSchema.shape.locationInfo,
  roomTypes: z
    .array(
      z.object({
        name: z.string().trim().min(2),
        totalBeds: z.number().int().positive(),
        annualPlanPrice: z.number().nonnegative().optional(),
        monthlyPlanPrice: z.number().nonnegative().optional(),
        securityDeposit: z.number().nonnegative().optional(),
      }),
    )
    .optional(),
  messPlans: z.array(messPlanSchema).optional(),
  addonServices: z.array(addonServiceSchema).optional(),
});
