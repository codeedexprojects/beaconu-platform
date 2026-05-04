import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_S3_BUCKET: z.string().min(1),
  AWS_REGION: z.string().min(1),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const missing = parsed.error.issues.map(
    (i) => `  ${i.path.join('.')}: ${i.message}`,
  )
  console.error('Invalid environment variables:\n' + missing.join('\n'))
  process.exit(1)
}

export const env = parsed.data
export type Env = typeof env
