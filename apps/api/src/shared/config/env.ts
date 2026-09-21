import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GOOGLE_MEET_REFRESH_TOKEN: z.string().default(""),
  GOOGLE_MEET_CALENDAR_ID: z.string().default("primary"),
  RAZORPAY_KEY_ID: z.string().default(""),
  RAZORPAY_KEY_SECRET: z.string().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().default(""),
  AWS_ACCESS_KEY_ID: z.string().default(""),
  AWS_SECRET_ACCESS_KEY: z.string().default(""),
  AWS_S3_BUCKET: z.string().default(""),
  AWS_REGION: z.string().default(""),
  FIREBASE_PROJECT_ID: z.string().default(""),
  FIREBASE_CLIENT_EMAIL: z.string().default(""),
  FIREBASE_PRIVATE_KEY: z.string().default(""),
  // Base URLs for referral/setup links built in college-url.utils.ts. Optional
  // here (so local dev keeps using the localhost fallback) but required
  // below when NODE_ENV is production, so a missing value fails startup
  // instead of silently shipping a localhost link.
  COLLEGE_WEB_URL: z.string().url().optional(),
  COLLEGE_ADMIN_URL: z.string().url().optional(),
  APP_SHARE_URL: z.string().url().optional(),
  WEB_URL: z.string().url().optional(),
});

const parsed = envSchema
  .refine((data) => data.NODE_ENV !== "production" || !!data.COLLEGE_WEB_URL, {
    message: "COLLEGE_WEB_URL is required when NODE_ENV=production",
    path: ["COLLEGE_WEB_URL"],
  })
  .refine(
    (data) => data.NODE_ENV !== "production" || !!data.COLLEGE_ADMIN_URL,
    {
      message: "COLLEGE_ADMIN_URL is required when NODE_ENV=production",
      path: ["COLLEGE_ADMIN_URL"],
    },
  )
  .refine(
    (data) =>
      data.NODE_ENV !== "production" || !!data.APP_SHARE_URL || !!data.WEB_URL,
    {
      message: "APP_SHARE_URL or WEB_URL is required when NODE_ENV=production",
      path: ["APP_SHARE_URL"],
    },
  )
  .safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues.map(
    (i) => `  ${i.path.join(".")}: ${i.message}`,
  );
  console.error("Invalid environment variables:\n" + missing.join("\n"));
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
