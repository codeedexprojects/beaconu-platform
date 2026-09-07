-- Materialized views backing the college-admin "Reports & Demographics"
-- dashboard. Prisma has no native materialized-view support, so this
-- migration's SQL is hand-written (same documented exception as
-- CREATE SEQUENCE for dbgenerated() defaults) rather than diff-generated.
--
-- All three are refreshed on a schedule by a BullMQ job
-- (materialized-view-refresh, see apps/api) using
-- `REFRESH MATERIALIZED VIEW CONCURRENTLY`, which requires each view to
-- carry a UNIQUE index — created below alongside each view.
--
-- Grain: one row per (college_id, admission_cycle_id) for the funnel view,
-- and one row per (college_id, admission_cycle_id, <dimension>) for the
-- demographic/geography views, so a single college-scoped query with an
-- index-only scan serves each report section.

-- ── Admissions Funnel Lifecycle ─────────────────────────────────────────
-- One row per (college, cycle): counts at each pipeline stage, derived
-- from application_courses.status (submitted..enrolled) and
-- applications.fee_payment_status (fee-paid is tracked at the
-- application level, not per course).
CREATE MATERIALIZED VIEW mv_college_admissions_funnel AS
SELECT
  a.college_id,
  a.admission_cycle_id,
  count(*) FILTER (WHERE true)                                              AS initiated_count,
  count(*) FILTER (WHERE a.fee_payment_status = 'paid')                     AS fee_paid_count,
  count(*) FILTER (WHERE a.form_status = 'submitted')                       AS submitted_count,
  count(*) FILTER (
    WHERE ac.status IN (
      'under_review','eligibility_check','assessment_pending',
      'assessment_completed','interview_pending','interview_completed',
      'shortlisted','offer_issued','token_paid','enrolled'
    )
  )                                                                         AS verified_count,
  count(*) FILTER (
    WHERE ac.status IN ('assessment_pending','assessment_completed')
  )                                                                         AS assessment_count,
  count(*) FILTER (
    WHERE ac.status IN ('offer_issued','token_paid','enrolled')
  )                                                                         AS offer_issued_count,
  count(*) FILTER (WHERE ac.status IN ('token_paid','enrolled'))            AS token_paid_count,
  count(*) FILTER (WHERE ac.status = 'enrolled')                            AS confirmed_count,
  avg(
    EXTRACT(EPOCH FROM (e.enrolled_at - a.submitted_at)) / 86400.0
  ) FILTER (WHERE ac.status = 'enrolled' AND a.submitted_at IS NOT NULL)    AS avg_days_to_admission
FROM applications a
JOIN application_courses ac ON ac.application_id = a.id AND ac.is_primary = true
LEFT JOIN enrollments e ON e.application_course_id = ac.id
GROUP BY a.college_id, a.admission_cycle_id;

CREATE UNIQUE INDEX uq_mv_admissions_funnel
  ON mv_college_admissions_funnel (college_id, admission_cycle_id);

-- ── Age & Gender Insights ───────────────────────────────────────────────
-- One row per (college, cycle, age_bucket, gender). Age is computed from
-- personal_details->>'date_of_birth' at refresh time (a snapshot as of
-- the last refresh, not live-updating by the minute — acceptable for a
-- reporting dashboard).
CREATE MATERIALIZED VIEW mv_college_applicant_demographics AS
SELECT
  a.college_id,
  a.admission_cycle_id,
  CASE
    WHEN dob IS NULL THEN 'unknown'
    WHEN age_years BETWEEN 16 AND 18 THEN '16-18'
    WHEN age_years BETWEEN 19 AND 21 THEN '18-21'
    WHEN age_years BETWEEN 22 AND 25 THEN '21-25'
    ELSE 'other'
  END AS age_bucket,
  COALESCE(NULLIF(lower(a.personal_details ->> 'gender'), ''), 'unknown') AS gender,
  count(*) AS applicant_count
FROM applications a
CROSS JOIN LATERAL (
  SELECT
    (a.personal_details ->> 'date_of_birth')::date AS dob
) parsed
CROSS JOIN LATERAL (
  SELECT
    CASE WHEN parsed.dob IS NULL THEN NULL
      ELSE EXTRACT(YEAR FROM age(parsed.dob))::int
    END AS age_years
) computed
GROUP BY a.college_id, a.admission_cycle_id, age_bucket, gender;

CREATE UNIQUE INDEX uq_mv_applicant_demographics
  ON mv_college_applicant_demographics (college_id, admission_cycle_id, age_bucket, gender);

-- ── Geographic Origin Analysis ───────────────────────────────────────────
-- One row per (college, cycle, country, state, district). Falls back to
-- the correspondence address when permanent is unset (the form only
-- stores "permanent" separately when it differs from correspondence —
-- see address_details.same_as_correspondence), so this must coalesce
-- both, not read "permanent" alone.
CREATE MATERIALIZED VIEW mv_college_applicant_geography AS
SELECT
  a.college_id,
  a.admission_cycle_id,
  COALESCE(
    NULLIF(a.address_details -> 'permanent' ->> 'country', ''),
    NULLIF(a.address_details -> 'correspondence' ->> 'country', ''),
    'unknown'
  ) AS country,
  COALESCE(
    NULLIF(a.address_details -> 'permanent' ->> 'state', ''),
    NULLIF(a.address_details -> 'correspondence' ->> 'state', ''),
    'unknown'
  ) AS state,
  COALESCE(
    NULLIF(a.address_details -> 'permanent' ->> 'district', ''),
    NULLIF(a.address_details -> 'correspondence' ->> 'district', ''),
    'unknown'
  ) AS district,
  count(*) AS applicant_count
FROM applications a
GROUP BY a.college_id, a.admission_cycle_id, country, state, district;

CREATE UNIQUE INDEX uq_mv_applicant_geography
  ON mv_college_applicant_geography (college_id, admission_cycle_id, country, state, district);
