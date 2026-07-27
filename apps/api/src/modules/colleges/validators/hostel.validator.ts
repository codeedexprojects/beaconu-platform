import { z } from "zod";

export const publicHostelListParamSchema = z.object({
  slug: z.string().min(1, "College slug is required"),
});

export const publicHostelDetailParamSchema = z.object({
  slug: z.string().min(1, "College slug is required"),
  hostelId: z.string().min(1, "Hostel ID is required"),
});

export const updateHostelSchema = z.object({
  hostelType: z.enum(["boys", "girls", "co-ed"]).optional(),
  isOnCampus: z.boolean().optional(),
  distanceFromCampus: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  totalBeds: z.number().int().positive().optional().nullable(),
  coverImageUrl: z.string().trim().url().optional().nullable(),
  tags: z
    .array(
      z.object({
        label: z.string().trim().min(1),
        color: z.string().trim().optional(),
      }),
    )
    .optional(),
  badge: z.string().trim().optional().nullable(),
  safetyTier: z.string().trim().optional().nullable(),
  wardenInfo: z
    .object({
      name: z.string().trim().min(1),
      phone: z.string().trim().min(1),
      whatsapp: z.string().trim().optional(),
      email: z.string().trim().email().optional(),
      photo: z.string().trim().url().optional(),
      designation: z.string().trim().optional(),
      safetyFeatures: z
        .array(z.object({ label: z.string().trim().min(1) }))
        .optional(),
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
      addressLine2: z.string().trim().optional(),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      mapLink: z.string().trim().url().optional(),
      nearbyEssentials: z
        .array(
          z.object({
            type: z.string().trim().min(1),
            name: z.string().trim().min(1),
            distance: z.string().trim().min(1),
          }),
        )
        .optional(),
      collegeTransport: z
        .object({
          description: z.string().trim().optional(),
          busStopNote: z.string().trim().optional(),
        })
        .optional(),
      map: z
        .object({
          thumbnail: z.string().trim().url().optional(),
        })
        .optional(),
      utilities: z
        .array(
          z.object({
            category: z.string().trim().min(1),
            provider: z.string().trim().min(1),
            notes: z.string().trim().optional(),
          }),
        )
        .optional(),
      transit: z
        .array(
          z.object({
            route: z.string().trim().min(1),
            stop: z.string().trim().optional(),
            timing: z.string().trim().optional(),
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
  photos: z.array(z.string().trim().url()).optional(),
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
        feature_tags: z.array(z.string().trim()).optional().default([]),
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
  tags: updateHostelSchema.shape.tags,
  badge: updateHostelSchema.shape.badge,
  safetyTier: updateHostelSchema.shape.safetyTier,
  wardenInfo: updateHostelSchema.shape.wardenInfo,
  amenities: updateHostelSchema.shape.amenities,
  rules: updateHostelSchema.shape.rules,
  locationInfo: updateHostelSchema.shape.locationInfo,
  roomTypes: z.array(roomTypeSchema).optional(),
  messPlans: z.array(messPlanSchema).optional(),
  addonServices: z.array(addonServiceSchema).optional(),
});
