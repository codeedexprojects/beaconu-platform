import { prisma } from "@beaconu/db";

/** Names of the materialized views backing the college-admin "Reports &
 * Demographics" dashboard (see packages/db/prisma/migrations/
 * 20260904105249_reports_materialized_views). Fixed constants only —
 * never build this list from user input, since refresh uses
 * $executeRawUnsafe (REFRESH MATERIALIZED VIEW doesn't accept the view
 * name as a bound parameter). */
const REPORT_MATERIALIZED_VIEWS = [
  "mv_college_admissions_funnel",
  "mv_college_applicant_demographics",
  "mv_college_applicant_geography",
] as const;

export class ReportsMaterializedViewsRepository {
  /** Refreshes every report materialized view. CONCURRENTLY avoids
   * locking out readers during the refresh (requires the unique index
   * each view already has), at the cost of needing roughly 2x the space
   * mid-refresh and being slower than a plain REFRESH. Refreshes run
   * sequentially, not in parallel, to keep peak load on the DB bounded —
   * this job runs every 15 minutes, so a few extra seconds of total
   * runtime is not a concern. */
  static async refreshAll(): Promise<
    {
      view: string;
      durationMs: number;
    }[]
  > {
    const results: { view: string; durationMs: number }[] = [];
    for (const view of REPORT_MATERIALIZED_VIEWS) {
      const start = Date.now();
      await prisma.$executeRawUnsafe(
        `REFRESH MATERIALIZED VIEW CONCURRENTLY ${view}`,
      );
      results.push({ view, durationMs: Date.now() - start });
    }
    return results;
  }
}
