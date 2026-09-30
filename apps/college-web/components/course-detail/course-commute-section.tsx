import { CommuteRoutes } from "@/components/college-landing/commute-routes";
import type { PublicCommuteRoute } from "@beaconu/types";

interface CourseCommuteSectionProps {
  summary?: string;
  routes: PublicCommuteRoute[];
}

export function CourseCommuteSection({
  summary,
  routes,
}: CourseCommuteSectionProps) {
  if (routes.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">
        Commute details aren&apos;t available yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">Commute</h2>
      {summary ? (
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          {summary}
        </p>
      ) : null}
      <CommuteRoutes routes={routes} />
    </div>
  );
}
