"use client";

import { useState } from "react";
import { CheckCircle2, Download, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicFeesTab, PublicFeeTextListBlock } from "@beaconu/types";

interface FeesSectionProps {
  fees: PublicFeesTab;
}

function TextListBlock({
  block,
  variant,
}: {
  block: PublicFeeTextListBlock;
  variant: "included" | "excluded" | "neutral";
}) {
  const items = block.items ?? [];
  if (items.length === 0) return null;

  const Icon =
    variant === "included"
      ? CheckCircle2
      : variant === "excluded"
        ? XCircle
        : CheckCircle2;
  const iconClass =
    variant === "included"
      ? "text-emerald-600"
      : variant === "excluded"
        ? "text-destructive"
        : "text-foreground/70";

  return (
    <div className="rounded-2xl border border-border/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {block.title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconClass)} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FeesSection({ fees }: FeesSectionProps) {
  const details = fees.fee_details ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = details[activeIndex];

  if (details.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">
          {fees.title || "Fees"}
        </h2>
        {fees.fee_structure_pdf?.url ? (
          <a
            href={fees.fee_structure_pdf.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm font-medium hover:border-foreground/30"
          >
            <Download className="h-4 w-4" />
            {fees.fee_structure_pdf.label || "Download Fee Structure"}
          </a>
        ) : null}
      </div>

      {details.length > 1 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {details.map((detail, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                i === activeIndex
                  ? "border-foreground bg-foreground text-background"
                  : "border-border/60 hover:border-foreground/30",
              )}
            >
              {[detail.quota, detail.gender].filter(Boolean).join(" · ")}
            </button>
          ))}
        </div>
      ) : null}

      {active ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {active.tuition_fees?.rows?.length ? (
              <div className="rounded-2xl border border-border/60">
                <p className="border-b border-border/60 px-5 py-3 text-sm font-semibold">
                  {active.tuition_fees.title || "Tuition Amount"}
                </p>
                <div className="divide-y divide-border/60">
                  {active.tuition_fees.rows.map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-5 py-3 text-sm"
                    >
                      <span className="text-muted-foreground">{row.year}</span>
                      <span className="font-medium">{row.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-6 sm:grid-cols-2">
              {active.one_time_payable_fees?.items?.length ? (
                <div className="rounded-2xl border border-border/60 p-5">
                  <p className="text-sm font-semibold">
                    {active.one_time_payable_fees.title}
                  </p>
                  <div className="mt-3 space-y-2">
                    {active.one_time_payable_fees.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="font-medium">{item.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {active.additional_fees?.items?.length ? (
                <div className="rounded-2xl border border-border/60 p-5">
                  <p className="text-sm font-semibold">
                    {active.additional_fees.title}
                  </p>
                  <div className="mt-3 space-y-2">
                    {active.additional_fees.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="font-medium">{item.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {active.deadlines_and_installments?.items?.length ? (
              <div className="rounded-2xl border border-border/60 p-5">
                <p className="text-sm font-semibold">
                  {active.deadlines_and_installments.title}
                </p>
                <div className="mt-3 space-y-3">
                  {active.deadlines_and_installments.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {item.due}
                        </p>
                        <p className="mt-0.5">{item.label}</p>
                      </div>
                      <span className="font-semibold">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {active.fees_summary ? (
            <div className="h-fit rounded-2xl border border-foreground/20 bg-muted/40 p-5">
              <p className="text-sm font-semibold">
                {active.fees_summary.title || "Fees Summary"}
              </p>
              <div className="mt-4 space-y-4">
                {active.fees_summary.full_course_fee ? (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {active.fees_summary.full_course_fee.label}
                    </p>
                    <p className="mt-0.5 text-2xl font-bold tracking-tight">
                      {active.fees_summary.full_course_fee.amount}
                    </p>
                  </div>
                ) : null}
                {active.fees_summary.booking_amount ? (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {active.fees_summary.booking_amount.label}
                    </p>
                    <p className="mt-0.5 text-lg font-semibold">
                      {active.fees_summary.booking_amount.amount}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {fees.whats_included ? (
          <TextListBlock block={fees.whats_included} variant="included" />
        ) : null}
        {fees.whats_excluded ? (
          <TextListBlock block={fees.whats_excluded} variant="excluded" />
        ) : null}
        {fees.refund_policy ? (
          <TextListBlock block={fees.refund_policy} variant="neutral" />
        ) : null}
      </div>
    </section>
  );
}
