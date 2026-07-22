"use client";

import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicCourseCurriculum } from "@beaconu/types";

interface CurriculumSectionProps {
  curriculum: PublicCourseCurriculum;
}

export function CurriculumSection({ curriculum }: CurriculumSectionProps) {
  const semesters = curriculum.semesters ?? [];
  const [openId, setOpenId] = useState<string | null>(
    semesters.find((s) => s.expanded)?.id ?? null,
  );

  if (semesters.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {curriculum.title || "Curriculum"}
          </h2>
          {curriculum.subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {curriculum.subtitle}
            </p>
          ) : null}
        </div>
        {curriculum.brochure?.url ? (
          <a
            href={curriculum.brochure.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm font-medium hover:border-foreground/30"
          >
            <Download className="h-4 w-4" />
            {curriculum.brochure.label || "Download Brochure"}
          </a>
        ) : null}
      </div>

      <div className="mt-6 space-y-3">
        {semesters.map((semester, idx) => {
          const isOpen = openId === (semester.id ?? String(idx));
          const key = semester.id ?? String(idx);

          return (
            <div
              key={key}
              className="overflow-hidden rounded-2xl border border-border/60"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : key)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold">{semester.name}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              {isOpen ? (
                <div className="space-y-4 border-t border-border/60 px-5 py-4">
                  {(semester.core_subjects?.length ?? 0) > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Core Subjects
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {semester.core_subjects?.map((subject, i) => (
                          <li
                            key={`${subject}-${i}`}
                            className="rounded-full bg-muted px-3 py-1 text-sm"
                          >
                            {subject}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {(semester.specializations?.length ?? 0) > 0
                    ? semester.specializations?.map((spec, i) => (
                        <div key={`${spec.title}-${i}`}>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {spec.title}
                            {spec.selected ? " · Selected" : ""}
                          </p>
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {spec.subjects?.map((subject, j) => (
                              <li
                                key={`${subject}-${j}`}
                                className="rounded-full bg-muted px-3 py-1 text-sm"
                              >
                                {subject}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    : null}

                  {semester.footnote ? (
                    <p className="text-xs text-muted-foreground">
                      {semester.footnote}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
