ALTER TABLE "counsellor_registration_requests"
  ADD COLUMN IF NOT EXISTS "gender"          VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "city"            VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "known_languages" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "specialization"  TEXT,
  ADD COLUMN IF NOT EXISTS "license_number"  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "password_hash"   TEXT;
