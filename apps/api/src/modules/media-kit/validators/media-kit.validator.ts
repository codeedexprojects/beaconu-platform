import { z } from "zod";

export const createMediaKitSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(255),
    asset_type: z.enum(["poster", "video", "brochure"]),
    scope: z.enum(["campus_wide", "course_specific"]),
    course_id: z.string().optional(),
    file_url: z.string().trim().url("Valid file URL is required"),
    file_name: z.string().trim().max(255).optional(),
    file_size_bytes: z.number().int().positive().optional(),
    thumbnail_url: z.string().trim().url().optional(),
    sort_order: z.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.scope === "course_specific" && !data.course_id) {
      ctx.addIssue({
        code: "custom",
        path: ["course_id"],
        message: "Course is required when scope is course_specific",
      });
    }
    if (data.scope === "campus_wide" && data.course_id) {
      ctx.addIssue({
        code: "custom",
        path: ["course_id"],
        message: "Course must not be set when scope is campus_wide",
      });
    }
  });

export const updateMediaKitSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  thumbnail_url: z.string().trim().url().optional(),
});

export const mediaKitCollegeAdminListQuerySchema = z.object({
  asset_type: z.enum(["poster", "video", "brochure"]).optional(),
  scope: z.enum(["campus_wide", "course_specific"]).optional(),
  course_id: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const mediaKitAmbassadorListQuerySchema =
  mediaKitCollegeAdminListQuerySchema;

export const mediaKitAssociateListQuerySchema =
  mediaKitCollegeAdminListQuerySchema.extend({
    college_id: z.string().optional(),
  });

export type CreateMediaKitInput = z.infer<typeof createMediaKitSchema>;
export type UpdateMediaKitInput = z.infer<typeof updateMediaKitSchema>;
export type MediaKitCollegeAdminListQuery = z.infer<
  typeof mediaKitCollegeAdminListQuerySchema
>;
export type MediaKitAssociateListQuery = z.infer<
  typeof mediaKitAssociateListQuerySchema
>;
