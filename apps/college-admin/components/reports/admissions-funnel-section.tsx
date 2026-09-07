"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Download } from "lucide-react";
import { useAdmissionsFunnel } from "@/hooks/use-reports";
import { getErrorMessage } from "@/lib/api";
import type { AdmissionsFunnel } from "@/lib/services/reports.service";

const STAGES: { key: keyof AdmissionsFunnel; label: string }[] = [
  { key: "initiated", label: "Initiated" },
  { key: "feePaid", label: "Fee Paid" },
  { key: "submitted", label: "Submitted" },
  { key: "verified", label: "Verified" },
  { key: "assessment", label: "Assessment" },
  { key: "offerIssued", label: "Offer" },
  { key: "tokenPaid", label: "Token Paid" },
  { key: "confirmed", label: "Confirmed" },
];

/** Which stage gets the gold "currently active" treatment — the earliest
 * stage in the pipeline that still has a meaningful number of applicants
 * sitting in it (i.e. the stage most in need of attention), falling back
 * to the last stage if every one is fully drained. */
function findActiveStageIndex(data: AdmissionsFunnel | undefined): number {
  if (!data) return STAGES.length - 1;
  for (let i = 0; i < STAGES.length - 1; i++) {
    const current = Number(data[STAGES[i].key]);
    const next = Number(data[STAGES[i + 1].key]);
    if (current > next) return i;
  }
  return STAGES.length - 1;
}

export function AdmissionsFunnelSection({
  admissionCycleId,
}: {
  admissionCycleId?: string;
}) {
  const { data, isLoading, error } = useAdmissionsFunnel(admissionCycleId);
  const activeIndex = findActiveStageIndex(data);

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold tracking-tight">
        Admissions Funnel Lifecycle
      </h2>
      <Card className="border-0 shadow-sm bg-card/60">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex gap-6 overflow-x-auto pb-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-20 shrink-0 rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {getErrorMessage(error)}
            </div>
          ) : (
            <>
              <div className="relative flex justify-between gap-2 overflow-x-auto px-1 pb-1 pt-2">
                {/* dotted connecting line running through the node dots */}
                <div
                  className="pointer-events-none absolute left-6 right-6 top-[74px] border-t-2 border-dotted border-border"
                  aria-hidden
                />

                {STAGES.map(({ key, label }, i) => {
                  const value = Number(data?.[key] ?? 0);
                  const isLast = i === STAGES.length - 1;
                  const isActive = i === activeIndex;
                  const highlighted = isActive || isLast;

                  return (
                    <div
                      key={key}
                      className="relative flex shrink-0 flex-col items-center gap-3"
                    >
                      <div className="relative">
                        <div
                          className={`flex h-11 min-w-[68px] items-center justify-center rounded-2xl px-3 text-base font-bold shadow-sm ${
                            highlighted
                              ? "bg-gold text-navy-dark"
                              : "bg-navy-dark text-white"
                          }`}
                        >
                          {value >= 1000
                            ? `${(value / 1000).toFixed(1)}k`
                            : value.toLocaleString()}
                        </div>
                        {/* speech-bubble pointer */}
                        <div
                          className={`absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[7px] border-x-transparent ${
                            highlighted ? "border-t-gold" : "border-t-navy-dark"
                          }`}
                          aria-hidden
                        />
                      </div>

                      {/* node dot on the connecting line */}
                      <span
                        className={`z-10 h-3 w-3 rounded-full border-2 border-background ${
                          isActive
                            ? "bg-gold ring-4 ring-gold/25"
                            : isLast
                              ? "bg-gold"
                              : "bg-navy-dark/70"
                        }`}
                      />

                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wide ${
                          highlighted
                            ? "text-navy-dark"
                            : "text-muted-foreground"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-xl bg-muted/50 px-5 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Overall Conversion Rate
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {data?.overallConversionRate != null
                      ? `${data.overallConversionRate}%`
                      : "—"}
                  </p>
                </div>
                <div className="h-9 w-px bg-border" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Avg. Time to Admission
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {data?.avgDaysToAdmission != null
                      ? `${data.avgDaysToAdmission} Days`
                      : "—"}
                  </p>
                </div>
                <button
                  type="button"
                  className="ml-auto flex items-center gap-2 rounded-lg bg-navy-dark px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                >
                  <Download className="h-3.5 w-3.5" />
                  Generate Full Funnel Report
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
