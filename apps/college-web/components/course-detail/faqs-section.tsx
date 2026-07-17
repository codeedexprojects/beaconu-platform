"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicCourseFaqs } from "@beaconu/types";

interface FaqsSectionProps {
  faqs: PublicCourseFaqs;
}

export function FaqsSection({ faqs }: FaqsSectionProps) {
  const items = faqs.items ?? [];
  const [openIndex, setOpenIndex] = useState<number | null>(
    items.findIndex((i) => i.expanded) >= 0
      ? items.findIndex((i) => i.expanded)
      : null,
  );

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">
        {faqs.title || "Frequently Asked Questions"}
      </h2>

      <div className="mt-6 space-y-2">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={`${item.question}-${i}`}
              className="overflow-hidden rounded-2xl border border-border/60"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span className="text-sm font-medium">{item.question}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen ? (
                <p className="border-t border-border/60 px-5 py-4 text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
