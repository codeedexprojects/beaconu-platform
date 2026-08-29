import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, GraduationCap } from "lucide-react";
import type { PublicScholarship } from "@beaconu/types";

interface ScholarshipsSectionProps {
  scholarships: PublicScholarship[];
  subdomain: string;
}

export function ScholarshipsSection({
  scholarships,
  subdomain,
}: ScholarshipsSectionProps) {
  if (scholarships.length === 0) return null;

  return (
    <section id="scholarships" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-headerTeal">
            <span className="h-px w-6 bg-headerTeal" />
            Supports
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Scholarships & Financial Support
          </h2>
        </div>
        <Link
          href={`/college/${subdomain}#scholarships`}
          className="flex items-center gap-1 text-sm font-medium text-headerTeal hover:text-headerTeal-dark"
        >
          View All Programmes
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="no-scrollbar mt-8 flex gap-5 overflow-x-auto pb-2">
        {scholarships.map((scholarship) => (
          <div
            key={scholarship.id}
            className="flex w-96 shrink-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-white"
          >
            <div className="relative h-48 w-full border-b-4 border-headerTeal-dark bg-muted">
              {scholarship.coverImageUrl ? (
                <Image
                  src={scholarship.coverImageUrl}
                  alt={scholarship.displayLabel ?? scholarship.name}
                  fill
                  sizes="384px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                  <GraduationCap className="h-12 w-12 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="min-h-[2.75rem] text-base font-semibold leading-snug">
                {scholarship.displayLabel ?? scholarship.name}
              </h3>
              {scholarship.discountDisplay ? (
                <p className="mt-1 text-sm font-bold tracking-tight">
                  {scholarship.discountDisplay}
                </p>
              ) : null}
              <Link
                href={`/college/${subdomain}#scholarships`}
                className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-sm font-medium text-headerTeal"
              >
                View Details
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
