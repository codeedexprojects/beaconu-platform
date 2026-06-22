import { z } from "zod";

const USER_TYPES = [
  "student",
  "staff",
  "platform_admin",
  "blink_associate",
  "blink_employee",
  "blink_ambassador",
  "counsellor",
] as const;

export const notificationSchemas = {
  sendPush: z.object({
    user_id: z.string().uuid("user_id must be a valid UUID"),
    user_type: z.enum(USER_TYPES, {
      error: `user_type must be one of: ${USER_TYPES.join(", ")}`,
    }),
    title: z.string().trim().min(1, "Title is required").max(200),
    body: z.string().trim().min(1, "Body is required").max(1000),
    data: z.record(z.string(), z.string()).optional(),
    image_url: z
      .string()
      .trim()
      .url("image_url must be a valid URL")
      .optional(),
  }),
};
