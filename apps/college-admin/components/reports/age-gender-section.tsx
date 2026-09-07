"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useAgeGenderInsights } from "@/hooks/use-reports";
import { getErrorMessage } from "@/lib/api";

const AGE_LABELS: Record<string, string> = {
  "16-18": "16 – 18 Years",
  "18-21": "18 – 21 Years",
  "21-25": "21 – 25 Years",
  other: "25+ Years",
  unknown: "Not Provided",
};

const GENDER_COLORS: Record<string, string> = {
  male: "bg-navy",
  female: "bg-amber-500",
  other: "bg-muted-foreground",
  unknown: "bg-muted-foreground/40",
};

export function AgeGenderSection({
  admissionCycleId,
}: {
  admissionCycleId?: string;
}) {
  const { data, isLoading, error } = useAgeGenderInsights(admissionCycleId);
  const maxAgeCount = Math.max(
    1,
    ...(data?.ageGroups.map((g) => g.count) ?? [1]),
  );

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold tracking-tight">
        Age &amp; Gender Insights
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-0 shadow-sm bg-card/60">
          <CardContent className="p-6">
            <p className="mb-5 text-sm font-bold">Applicants by Age Group</p>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {getErrorMessage(error)}
              </div>
            ) : (
              <div className="space-y-4">
                {data?.ageGroups.map((g) => (
                  <div key={g.bucket}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {AGE_LABELS[g.bucket] ?? g.bucket}
                      </span>
                      <span className="text-muted-foreground">
                        {g.count.toLocaleString()} Applicants
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-navy"
                        style={{
                          width: `${Math.max(4, (g.count / maxAgeCount) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/60">
          <CardContent className="p-6">
            <p className="mb-5 text-sm font-bold">Gender Distribution</p>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="mx-auto h-16 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {getErrorMessage(error)}
              </div>
            ) : (
              <>
                <div className="py-4 text-center">
                  <p className="text-4xl font-bold">
                    {(data?.total ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Total
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  {data?.genderDistribution.map((g) => {
                    const pct =
                      data.total > 0
                        ? Math.round((g.count / data.total) * 100)
                        : 0;
                    return (
                      <div
                        key={g.gender}
                        className="flex items-center gap-1.5 text-sm"
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${GENDER_COLORS[g.gender] ?? "bg-muted-foreground"}`}
                        />
                        <span className="font-medium capitalize">
                          {g.gender}
                        </span>
                        <span className="text-muted-foreground">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
