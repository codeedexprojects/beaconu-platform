"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScholarshipDetails } from "@/lib/services/public-course.service";
import type {
  PublicFinancialAidTab,
  PublicScholarshipPortEntryOption,
  PublicScholarshipResolvedDetails,
} from "@beaconu/types";

interface FinancialAidSectionProps {
  aid: PublicFinancialAidTab;
  slug: string;
  courseId: string;
}

function ScholarshipCalculator({
  slug,
  courseId,
  title,
}: {
  slug: string;
  courseId: string;
  title?: string;
}) {
  const [portEntries, setPortEntries] = useState<
    PublicScholarshipPortEntryOption[]
  >([]);
  const [portId, setPortId] = useState<string | undefined>();
  const [rangeId, setRangeId] = useState<string | undefined>();
  const [details, setDetails] =
    useState<PublicScholarshipResolvedDetails | null>(null);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Load the port entry / score range options once.
  useEffect(() => {
    let cancelled = false;
    setLoadingEntries(true);
    getScholarshipDetails(slug, courseId)
      .then((result) => {
        if (cancelled) return;
        const entries = result.port_entries ?? [];
        setPortEntries(entries);
        const firstPort = entries[0];
        const firstRange = firstPort?.score_ranges?.[0];
        setPortId(firstPort?.id);
        setRangeId(firstRange?.id);
      })
      .finally(() => {
        if (!cancelled) setLoadingEntries(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, courseId]);

  // Resolve the discount details for the current selection.
  useEffect(() => {
    if (!portId || !rangeId) return;
    let cancelled = false;
    setLoadingDetails(true);
    getScholarshipDetails(slug, courseId, portId, rangeId)
      .then((result) => {
        if (!cancelled) setDetails(result.details ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoadingDetails(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, courseId, portId, rangeId]);

  if (loadingEntries) {
    return (
      <div className="flex justify-center rounded-2xl border border-border/60 p-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (portEntries.length === 0) return null;

  const activePort = portEntries.find((p) => p.id === portId) ?? portEntries[0];
  const scoreRanges = activePort?.score_ranges ?? [];

  return (
    <div className="rounded-2xl border border-border/60 p-5">
      <p className="text-sm font-semibold">
        {title || "Scholarship Calculator"}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <select
          value={activePort?.id}
          onChange={(e) => {
            const next = portEntries.find((p) => p.id === e.target.value);
            setPortId(next?.id);
            setRangeId(next?.score_ranges?.[0]?.id);
          }}
          className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
        >
          {portEntries.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={rangeId}
          onChange={(e) => setRangeId(e.target.value)}
          className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          disabled={scoreRanges.length === 0}
        >
          {scoreRanges.map((r) => (
            <option key={r.id} value={r.id}>
              {r.range_label}
            </option>
          ))}
        </select>
      </div>

      {loadingDetails ? (
        <div className="mt-4 flex justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : details ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-muted/60 p-3">
              <p className="text-xs text-muted-foreground">Scholarship</p>
              <p className="mt-0.5 text-lg font-semibold">
                {details.max_scholarship_amount}
              </p>
            </div>
            <div className="rounded-xl bg-muted/60 p-3">
              <p className="text-xs text-muted-foreground">Net Payable</p>
              <p className="mt-0.5 text-lg font-semibold">
                {details.net_payable_amount}
              </p>
            </div>
          </div>

          {(details.criteria?.length ?? 0) > 0 ? (
            <ul className="mt-4 space-y-1 border-t border-border/60 pt-3">
              {details.criteria?.map((term, i) => (
                <li key={i} className="text-xs text-muted-foreground">
                  • {term}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export function FinancialAidSection({
  aid,
  slug,
  courseId,
}: FinancialAidSectionProps) {
  const concessions = aid.financial_concessions?.items ?? [];
  const defaultOpenIndex = concessions.findIndex((i) => i.expanded);
  const [openIndex, setOpenIndex] = useState<number | null>(
    defaultOpenIndex >= 0 ? defaultOpenIndex : null,
  );

  const hasCalculator =
    (aid.merit_scholarship?.calculator?.port_entries?.length ?? 0) > 0;

  if (!hasCalculator && concessions.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">
        Financial aid details aren&apos;t available yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {hasCalculator ? (
        <section>
          <h2 className="text-xl font-bold tracking-tight">
            {aid.merit_scholarship?.title || "Merit Scholarship"}
          </h2>
          <div className="mt-5">
            <ScholarshipCalculator
              slug={slug}
              courseId={courseId}
              title={aid.merit_scholarship?.calculator?.title}
            />
          </div>
        </section>
      ) : null}

      {concessions.length > 0 ? (
        <section className={hasCalculator ? "mt-12" : undefined}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight">
              {aid.financial_concessions?.title || "Financial Concessions"}
            </h2>
            {aid.financial_concessions?.total_types_label ? (
              <span className="text-sm text-muted-foreground">
                {aid.financial_concessions.total_types_label}
              </span>
            ) : null}
          </div>

          <div className="mt-5 space-y-3">
            {concessions.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={`${item.name}-${i}`}
                  className="overflow-hidden rounded-2xl border border-border/60"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-medium">{item.name}</span>
                    <div className="flex items-center gap-3">
                      {item.discount_label ? (
                        <span className="rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background">
                          {item.discount_label}
                        </span>
                      ) : null}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </div>
                  </button>

                  {isOpen ? (
                    <div className="grid gap-4 border-t border-border/60 px-5 py-4 sm:grid-cols-3">
                      {(item.details?.eligibility_criteria?.items?.length ??
                        0) > 0 ? (
                        <div className="sm:col-span-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {item.details?.eligibility_criteria?.title}
                          </p>
                          <ul className="mt-2 space-y-1">
                            {item.details?.eligibility_criteria?.items?.map(
                              (crit, j) => (
                                <li
                                  key={j}
                                  className="text-sm text-muted-foreground"
                                >
                                  {crit}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      ) : null}
                      {item.details?.scholarship?.amount ? (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {item.details.scholarship.label}
                          </p>
                          <p className="mt-0.5 text-lg font-semibold">
                            {item.details.scholarship.amount}
                          </p>
                        </div>
                      ) : null}
                      {item.details?.net_payable?.amount ? (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {item.details.net_payable.label}
                          </p>
                          <p className="mt-0.5 text-lg font-semibold">
                            {item.details.net_payable.amount}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
