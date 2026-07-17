"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicInstitutionDepartment } from "@beaconu/types";

interface DepartmentsAccordionProps {
  departments: PublicInstitutionDepartment[];
}

function formatFee(fee: string | null, currency: string): string {
  if (!fee) return "Fee not available";
  const amount = Number(fee);
  if (!Number.isFinite(amount)) return "Fee not available";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DepartmentsAccordion({
  departments,
}: DepartmentsAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(
    departments.find((d) => d.expanded)?.id ?? null,
  );

  return (
    <div className="mt-6 space-y-3">
      {departments.map((department) => {
        const isOpen = openId === department.id;

        return (
          <div
            key={department.id}
            className="overflow-hidden rounded-2xl border border-border/60"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : department.id)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <div>
                <p className="text-sm font-semibold">{department.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {department.programs_available} program
                  {department.programs_available === 1 ? "" : "s"} available
                  {department.program_type_tabs.options.length > 0
                    ? ` · ${department.program_type_tabs.options.join(", ")}`
                    : ""}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {isOpen ? (
              <div className="border-t border-border/60 px-5 py-4">
                {department.courses.length > 0 ? (
                  <ul className="divide-y divide-border/60">
                    {department.courses.map((course) => (
                      <li
                        key={course.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                      >
                        <div>
                          <p className="font-medium">{course.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {[course.duration, course.mode]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatFee(course.fee, course.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No active programs listed yet.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
