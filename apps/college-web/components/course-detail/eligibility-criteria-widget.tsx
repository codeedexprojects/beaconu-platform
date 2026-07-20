"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getEligibilityCriteria } from "@/lib/services/public-course.service";
import type {
  PublicEligibilityCriterion,
  PublicEligibilityOption,
  PublicEligibilityQuota,
} from "@beaconu/types";

interface EligibilityCriteriaWidgetProps {
  slug: string;
  courseId: string;
  studentTypes: PublicEligibilityOption[];
  quotas: PublicEligibilityQuota[];
}

export function EligibilityCriteriaWidget({
  slug,
  courseId,
  studentTypes,
  quotas,
}: EligibilityCriteriaWidgetProps) {
  const [studentType, setStudentType] = useState<string | null>(null);
  const [quotaCategory, setQuotaCategory] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<PublicEligibilityCriterion[]>([]);
  const [loading, setLoading] = useState(false);

  async function applyFilters(nextStudentType: string, nextQuota: string) {
    setStudentType(nextStudentType);
    setQuotaCategory(nextQuota);
    setLoading(true);
    try {
      const result = await getEligibilityCriteria(
        slug,
        courseId,
        nextStudentType,
        nextQuota,
      );
      setCriteria(result.criteria ?? []);
    } finally {
      setLoading(false);
    }
  }

  if (studentTypes.length === 0 || quotas.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">Eligibility Criteria</h2>

      <div className="mt-5 flex flex-wrap gap-2">
        {studentTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() =>
              applyFilters(
                type.value ?? "",
                quotaCategory ?? quotas[0]?.id ?? "",
              )
            }
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              studentType === type.value
                ? "border-foreground bg-foreground text-background"
                : "border-border/60 hover:border-foreground/30",
            )}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {quotas.map((quota) => (
          <button
            key={quota.id}
            type="button"
            onClick={() =>
              applyFilters(
                studentType ?? studentTypes[0]?.value ?? "",
                quota.id ?? "",
              )
            }
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm capitalize transition-colors",
              quotaCategory === quota.id
                ? "border-foreground bg-foreground text-background"
                : "border-border/60 hover:border-foreground/30",
            )}
          >
            {quota.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : studentType && quotaCategory ? (
          criteria.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {criteria.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border/60 p-4"
                >
                  <p className="text-sm font-semibold">{item.heading}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No criteria listed for this combination yet.
            </p>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a student type and quota to view eligibility criteria.
          </p>
        )}
      </div>
    </section>
  );
}
