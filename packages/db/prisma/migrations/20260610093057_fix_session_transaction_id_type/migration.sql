-- counselling_sessions.transaction_id was created as UUID, but Razorpay
-- payment ids (e.g. "pay_xxx") and other gateway transaction ids are not
-- UUIDs. Widen the column to VARCHAR to match the Prisma schema (String?).
ALTER TABLE "counselling_sessions"
  ALTER COLUMN "transaction_id" TYPE VARCHAR(100) USING "transaction_id"::text;
