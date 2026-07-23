-- Manual recovery for 20260713082702_init, scoped narrowly to what's
-- currently blocking `migrate deploy` (course_quota_seats /
-- document_upload_config_quotas both FK into college_quotas).
-- That migration was force-marked --applied on 2026-07-20 after its
-- original run rolled back, so college_quotas (a genuinely new table,
-- not a pre-existing one) was never actually created.
-- Does NOT touch course_quotas.college_quota_id — that gap exists too
-- but isn't blocking anything in the current migration queue.

CREATE SEQUENCE IF NOT EXISTS "college_quota_seq";

CREATE TABLE "college_quotas" (
    "id" TEXT NOT NULL DEFAULT ('CQT-'::text || (nextval('college_quota_seq'::regclass))::text),
    "college_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "bucket_type" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "college_quotas_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_college_quotas_college" ON "college_quotas"("college_id");
CREATE INDEX "idx_college_quotas_bucket" ON "college_quotas"("college_id", "bucket_type");
CREATE INDEX "idx_college_quotas_active" ON "college_quotas"("college_id", "is_active");
CREATE UNIQUE INDEX "college_quotas_college_id_slug_key" ON "college_quotas"("college_id", "slug");

ALTER TABLE "college_quotas" ADD CONSTRAINT "college_quotas_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
