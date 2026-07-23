-- Manual recovery. course_quotas was never brought up to the target shape
-- from 20260713082702_init (it predates that migration under an older
-- shape: quota_name/seats instead of college_quota_id), so this migration's
-- literal rename (app_fee_reduction_* -> app_fee_adjustment_*) can't apply
-- since neither column exists. This does the full restructure to the
-- current schema.prisma CourseQuota model in one pass, adding the target
-- columns directly rather than the intermediate "reduction" names.
-- Per user decision: the one existing row ("Management Quota" test data,
-- course CRS-3) is deleted rather than backfilled.

DELETE FROM "course_quotas";

ALTER TABLE "course_quotas"
  DROP COLUMN "quota_name",
  DROP COLUMN "seats",
  ADD COLUMN "college_quota_id" TEXT NOT NULL,
  ADD COLUMN "app_fee_adjustment_type" VARCHAR(10),
  ADD COLUMN "app_fee_adjustment_value" DECIMAL(10,2);

-- course_quotas_course_id_quota_name_key was auto-dropped by DROP COLUMN
-- "quota_name" above (Postgres drops constraints that depend on a
-- dropped column automatically) — no explicit DROP CONSTRAINT needed.

ALTER TABLE "course_quotas" ADD CONSTRAINT "uq_course_college_quota" UNIQUE ("course_id", "college_quota_id");

CREATE INDEX "idx_quotas_college_quota" ON "course_quotas"("college_quota_id");

ALTER TABLE "course_quotas" ADD CONSTRAINT "course_quotas_college_quota_id_fkey" FOREIGN KEY ("college_quota_id") REFERENCES "college_quotas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
