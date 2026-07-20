import { GraduationCap } from "lucide-react";
import type { PublicScholarship } from "@beaconu/types";

interface ScholarshipsSectionProps {
  scholarships: PublicScholarship[];
}

export function ScholarshipsSection({
  scholarships,
}: ScholarshipsSectionProps) {
  if (scholarships.length === 0) return null;

  return (
    <section id="scholarships" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Scholarships & Financial Support
      </h2>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scholarships.map((scholarship) => (
          <div
            key={scholarship.id}
            className="rounded-2xl border border-border/60 p-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/5">
              <GraduationCap className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold">
              {scholarship.displayLabel ?? scholarship.name}
            </p>
            {scholarship.discountDisplay ? (
              <p className="mt-1 text-lg font-bold tracking-tight">
                {scholarship.discountDisplay}
              </p>
            ) : null}
            {scholarship.termsAndConditions ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {scholarship.termsAndConditions}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
