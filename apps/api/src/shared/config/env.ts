import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z
    .string()
    .default("beaconu-dev-jwt-secret-not-for-production-12345"),
  JWT_REFRESH_SECRET: z
    .string()
    .default("beaconu-dev-refresh-secret-not-for-production-12345"),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  RAZORPAY_KEY_ID: z.string().default(""),
  RAZORPAY_KEY_SECRET: z.string().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().default(""),
  AWS_ACCESS_KEY_ID: z.string().default(""),
  AWS_SECRET_ACCESS_KEY: z.string().default(""),
  AWS_S3_BUCKET: z.string().default(""),
  AWS_REGION: z.string().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues.map(
    (i) => `  ${i.path.join(".")}: ${i.message}`,
  );
  console.error("Invalid environment variables:\n" + missing.join("\n"));
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
