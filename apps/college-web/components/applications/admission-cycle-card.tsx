"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { AdmissionCycleItem } from "@beaconu/types";

interface AdmissionCycleCardProps {
  cycle: AdmissionCycleItem;
  subdomain: string;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function AdmissionCycleCard({
  cycle,
  subdomain,
}: AdmissionCycleCardProps) {
  return (
    <div className="rounded-2xl bg-field p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-background px-2.5 py-1 text-xs font-medium text-foreground">
          {formatLabel(cycle.programLevel)}
        </span>
        <span className="rounded-full bg-headerTeal-dark px-2.5 py-1 text-xs font-medium text-white">
          Open
        </span>
      </div>

      <p className="mt-3 font-semibold">{cycle.name}</p>
      <p className="text-sm text-muted-foreground">
        {formatLabel(cycle.applicationType)} · {cycle.admissionYear}
      </p>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5" />
        <span>
          {formatDate(cycle.startsOn)} – {formatDate(cycle.endsOn)}
        </span>
      </div>

      <Link
        href={`/college/${subdomain}/applications/new?cycle=${cycle.id}`}
        className="mt-4 flex h-10 items-center justify-center gap-1.5 rounded-full bg-headerTeal-dark text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Start Application
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
