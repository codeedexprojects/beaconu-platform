-- Create sequences
CREATE SEQUENCE IF NOT EXISTS "ambassador_code_seq";
CREATE SEQUENCE IF NOT EXISTS "counsellor_code_seq";

-- Add ambassador_code to blink_users (nullable — only campus ambassadors get one)
ALTER TABLE "blink_users" ADD COLUMN IF NOT EXISTS "ambassador_code" TEXT UNIQUE;

-- Backfill existing campus ambassadors
UPDATE "blink_users"
SET "ambassador_code" = 'CA-' || nextval('ambassador_code_seq'::regclass)::text
WHERE "ambassador_code" IS NULL
  AND "blink_role_id" IN (
    SELECT id FROM "blink_roles" WHERE slug = 'campus_ambassador'
  );

-- Add counsellor_code to counsellors (auto-generated for all counsellors)
ALTER TABLE "counsellors"
  ADD COLUMN IF NOT EXISTS "counsellor_code" TEXT UNIQUE
  DEFAULT ('CC-'::text || (nextval('counsellor_code_seq'::regclass))::text);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_blink_ambassador_code" ON "blink_users"("ambassador_code");
CREATE INDEX IF NOT EXISTS "idx_counsellors_code"      ON "counsellors"("counsellor_code");
