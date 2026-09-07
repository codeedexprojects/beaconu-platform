import { prisma } from "@beaconu/db";

/** Reads for the college-admin "Reports & Demographics" dashboard. Every
 * method reads from a materialized view (see packages/db/prisma/
 * migrations/20260904105249_reports_materialized_views), never live
 * tables — the views are refreshed every 15 minutes by
 * dashboard/jobs/materialized-view-refresh.job.ts, so figures here are a
 * snapshot as of the last refresh, not real-time. This trade-off is what
 * keeps each endpoint fast regardless of how many applications a college
 * has accumulated.
 *
 * admissionCycleId is optional on every method: when provided, scopes to
 * that one cycle; when omitted, aggregates across every cycle the college
 * has ever run (a college-wide "all time" view). */

type EnrollmentOverviewRow = {
  total_applications: bigint;
  offers_issued: bigint;
  confirmed_admissions: bigint;
};

export interface EnrollmentOverview {
  totalApplications: number;
  offersIssued: number;
  confirmedAdmissions: number;
}

type FunnelRow = {
  initiated_count: bigint;
  fee_paid_count: bigint;
  submitted_count: bigint;
  verified_count: bigint;
  assessment_count: bigint;
  offer_issued_count: bigint;
  token_paid_count: bigint;
  confirmed_count: bigint;
  avg_days_to_admission: number | null;
};

export interface AdmissionsFunnel {
  initiated: number;
  feePaid: number;
  submitted: number;
  verified: number;
  assessment: number;
  offerIssued: number;
  tokenPaid: number;
  confirmed: number;
  overallConversionRate: number | null;
  avgDaysToAdmission: number | null;
}

type DemographicsRow = {
  age_bucket: string;
  gender: string;
  applicant_count: bigint;
};

export interface AgeGenderInsights {
  ageGroups: { bucket: string; count: number }[];
  genderDistribution: { gender: string; count: number }[];
  total: number;
}

type GeographyRow = {
  country: string;
  state: string;
  district: string;
  applicant_count: bigint;
};

export interface GeographicOrigin {
  domestic: number;
  international: number;
  topInternationalCountries: { country: string; count: number }[];
  topStates: { state: string; count: number }[];
  topDistricts: { district: string; count: number }[];
}

export class ReportsQuery {
  static async getEnrollmentOverview(
    collegeId: string,
    admissionCycleId?: string,
  ): Promise<EnrollmentOverview> {
    const rows = await prisma.$queryRaw<EnrollmentOverviewRow[]>`
      SELECT
        coalesce(sum(initiated_count), 0)::bigint AS total_applications,
        coalesce(sum(offer_issued_count), 0)::bigint AS offers_issued,
        coalesce(sum(confirmed_count), 0)::bigint AS confirmed_admissions
      FROM mv_college_admissions_funnel
      WHERE college_id = ${collegeId}
        AND (${admissionCycleId ?? null}::text IS NULL OR admission_cycle_id = ${admissionCycleId ?? null})
    `;
    const row = rows[0];
    return {
      totalApplications: Number(row?.total_applications ?? 0),
      offersIssued: Number(row?.offers_issued ?? 0),
      confirmedAdmissions: Number(row?.confirmed_admissions ?? 0),
    };
  }

  static async getAdmissionsFunnel(
    collegeId: string,
    admissionCycleId?: string,
  ): Promise<AdmissionsFunnel> {
    const rows = await prisma.$queryRaw<FunnelRow[]>`
      SELECT
        coalesce(sum(initiated_count), 0)::bigint AS initiated_count,
        coalesce(sum(fee_paid_count), 0)::bigint AS fee_paid_count,
        coalesce(sum(submitted_count), 0)::bigint AS submitted_count,
        coalesce(sum(verified_count), 0)::bigint AS verified_count,
        coalesce(sum(assessment_count), 0)::bigint AS assessment_count,
        coalesce(sum(offer_issued_count), 0)::bigint AS offer_issued_count,
        coalesce(sum(token_paid_count), 0)::bigint AS token_paid_count,
        coalesce(sum(confirmed_count), 0)::bigint AS confirmed_count,
        avg(avg_days_to_admission) AS avg_days_to_admission
      FROM mv_college_admissions_funnel
      WHERE college_id = ${collegeId}
        AND (${admissionCycleId ?? null}::text IS NULL OR admission_cycle_id = ${admissionCycleId ?? null})
    `;
    const row = rows[0];
    const initiated = Number(row?.initiated_count ?? 0);
    const confirmed = Number(row?.confirmed_count ?? 0);

    return {
      initiated,
      feePaid: Number(row?.fee_paid_count ?? 0),
      submitted: Number(row?.submitted_count ?? 0),
      verified: Number(row?.verified_count ?? 0),
      assessment: Number(row?.assessment_count ?? 0),
      offerIssued: Number(row?.offer_issued_count ?? 0),
      tokenPaid: Number(row?.token_paid_count ?? 0),
      confirmed,
      overallConversionRate:
        initiated > 0 ? Math.round((confirmed / initiated) * 1000) / 10 : null,
      avgDaysToAdmission:
        row?.avg_days_to_admission != null
          ? Math.round(Number(row.avg_days_to_admission) * 10) / 10
          : null,
    };
  }

  static async getAgeGenderInsights(
    collegeId: string,
    admissionCycleId?: string,
  ): Promise<AgeGenderInsights> {
    const rows = await prisma.$queryRaw<DemographicsRow[]>`
      SELECT age_bucket, gender, applicant_count
      FROM mv_college_applicant_demographics
      WHERE college_id = ${collegeId}
        AND (${admissionCycleId ?? null}::text IS NULL OR admission_cycle_id = ${admissionCycleId ?? null})
    `;

    const ageTotals = new Map<string, number>();
    const genderTotals = new Map<string, number>();
    let total = 0;

    for (const r of rows) {
      const count = Number(r.applicant_count);
      total += count;
      ageTotals.set(r.age_bucket, (ageTotals.get(r.age_bucket) ?? 0) + count);
      genderTotals.set(r.gender, (genderTotals.get(r.gender) ?? 0) + count);
    }

    const AGE_ORDER = ["16-18", "18-21", "21-25", "other", "unknown"];
    const ageGroups = AGE_ORDER.filter((b) => ageTotals.has(b)).map(
      (bucket) => ({ bucket, count: ageTotals.get(bucket)! }),
    );

    const genderDistribution = Array.from(genderTotals.entries()).map(
      ([gender, count]) => ({ gender, count }),
    );

    return { ageGroups, genderDistribution, total };
  }

  static async getGeographicOrigin(
    collegeId: string,
    admissionCycleId?: string,
  ): Promise<GeographicOrigin> {
    const rows = await prisma.$queryRaw<GeographyRow[]>`
      SELECT country, state, district, applicant_count
      FROM mv_college_applicant_geography
      WHERE college_id = ${collegeId}
        AND (${admissionCycleId ?? null}::text IS NULL OR admission_cycle_id = ${admissionCycleId ?? null})
    `;

    let domestic = 0;
    let international = 0;
    const countryTotals = new Map<string, number>();
    const stateTotals = new Map<string, number>();
    const districtTotals = new Map<string, number>();

    for (const r of rows) {
      const count = Number(r.applicant_count);
      const isDomestic = r.country === "India";
      if (isDomestic) domestic += count;
      else if (r.country !== "unknown") international += count;

      if (!isDomestic && r.country !== "unknown") {
        countryTotals.set(
          r.country,
          (countryTotals.get(r.country) ?? 0) + count,
        );
      }
      if (isDomestic) {
        if (r.state !== "unknown") {
          stateTotals.set(r.state, (stateTotals.get(r.state) ?? 0) + count);
        }
        if (r.district !== "unknown") {
          districtTotals.set(
            r.district,
            (districtTotals.get(r.district) ?? 0) + count,
          );
        }
      }
    }

    const topN = (map: Map<string, number>, n: number) =>
      Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, n);

    return {
      domestic,
      international,
      topInternationalCountries: topN(countryTotals, 10).map(
        ([country, count]) => ({ country, count }),
      ),
      topStates: topN(stateTotals, 10).map(([state, count]) => ({
        state,
        count,
      })),
      topDistricts: topN(districtTotals, 10).map(([district, count]) => ({
        district,
        count,
      })),
    };
  }
}
