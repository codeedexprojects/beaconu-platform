"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useEnrollmentOverview } from "@/hooks/use-reports";
import { getErrorMessage } from "@/lib/api";

const TILES: {
  key: "totalApplications" | "offersIssued" | "confirmedAdmissions";
  label: string;
}[] = [
  { key: "totalApplications", label: "Total Applications" },
  { key: "offersIssued", label: "Offers Issued" },
  { key: "confirmedAdmissions", label: "Confirmed Admissions" },
];

export function EnrollmentOverviewSection({
  admissionCycleId,
}: {
  admissionCycleId?: string;
}) {
  const { data, isLoading, error } = useEnrollmentOverview(admissionCycleId);

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold tracking-tight">Enrollment Overview</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-16" />
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {getErrorMessage(error)}
          </div>
        ) : (
          TILES.map(({ key, label }) => (
            <Card key={key} className="border-0 shadow-sm bg-card/60">
              <CardContent className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {(data?.[key] ?? 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
