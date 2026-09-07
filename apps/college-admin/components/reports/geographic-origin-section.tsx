"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useGeographicOrigin } from "@/hooks/use-reports";
import { getErrorMessage } from "@/lib/api";

export function GeographicOriginSection({
  admissionCycleId,
}: {
  admissionCycleId?: string;
}) {
  const { data, isLoading, error } = useGeographicOrigin(admissionCycleId);
  const total = (data?.domestic ?? 0) + (data?.international ?? 0);
  const domesticPct =
    total > 0 ? Math.round((data!.domestic / total) * 100) : 0;
  const maxState = Math.max(1, ...(data?.topStates.map((s) => s.count) ?? [1]));

  if (isLoading) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-bold tracking-tight">
          Geographic Origin Analysis
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="space-y-3 p-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-bold tracking-tight">
          Geographic Origin Analysis
        </h2>
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {getErrorMessage(error)}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold tracking-tight">
        Geographic Origin Analysis
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* National Insights */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <div className="bg-navy p-4 text-xs font-bold uppercase tracking-wider text-white">
            National Insights
          </div>
          <CardContent className="p-5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Domestic vs International
            </p>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-navy"
                style={{ width: `${domesticPct}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-xs font-medium">
              <span>{domesticPct}% Domestic</span>
              <span className="text-muted-foreground">
                {100 - domesticPct}% International
              </span>
            </div>

            <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Top International Sources
            </p>
            {data && data.topInternationalCountries.length > 0 ? (
              <ul className="space-y-1.5 text-sm">
                {data.topInternationalCountries.slice(0, 5).map((c) => (
                  <li key={c.country} className="flex justify-between">
                    <span>{c.country}</span>
                    <span className="font-semibold">{c.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">None</p>
            )}
          </CardContent>
        </Card>

        {/* State Insights */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <div className="flex items-center justify-between bg-navy p-4 text-xs font-bold uppercase tracking-wider text-white">
            State Insights
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal">
              Regional Ranking
            </span>
          </div>
          <CardContent className="space-y-3 p-5">
            {data && data.topStates.length > 0 ? (
              data.topStates.slice(0, 5).map((s) => {
                const pct = Math.round((s.count / maxState) * 100);
                return (
                  <div key={s.state}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{s.state}</span>
                      <span className="text-muted-foreground">
                        {total > 0 ? Math.round((s.count / total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>

        {/* District Insights */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <div className="flex items-center justify-between bg-navy p-4 text-xs font-bold uppercase tracking-wider text-white">
            District Insights
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal">
              Granular View
            </span>
          </div>
          <CardContent className="p-5">
            {data && data.topDistricts.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>District</span>
                  <span>Applicants</span>
                </div>
                {data.topDistricts.slice(0, 6).map((d) => (
                  <div
                    key={d.district}
                    className="flex justify-between border-b border-border/50 py-1.5 text-sm last:border-b-0"
                  >
                    <span>{d.district}</span>
                    <span className="font-semibold">{d.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
