"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudentApplicationListItemDto } from "@beaconu/types";

interface ApplicationProgressCardProps {
  application: StudentApplicationListItemDto;
  subdomain: string;
}

const TOTAL_STEPS = 8;

const statusLabels: Record<string, string> = {
  draft: "In Progress",
  submitted: "Submitted",
  under_review: "Under Review",
};

function formatStatus(status: string): string {
  return (
    statusLabels[status] ??
    status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

export function ApplicationProgressCard({
  application,
  subdomain,
}: ApplicationProgressCardProps) {
  const isDraft = application.formStatus === "draft";
  const progressPct = isDraft
    ? Math.min(100, Math.round((application.currentStep / TOTAL_STEPS) * 100))
    : 100;

  return (
    <Link
      href={`/college/${subdomain}/applications/${application.id}`}
      className="flex items-center gap-4 rounded-2xl border border-border/60 p-4 transition-colors hover:border-foreground/30"
    >
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
        <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90">
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            strokeWidth="4"
            className="stroke-muted"
          />
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 24}
            strokeDashoffset={2 * Math.PI * 24 * (1 - progressPct / 100)}
            className="stroke-primary"
          />
        </svg>
        <GraduationCap className="h-5 w-5 text-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{application.cycleName}</p>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
              isDraft
                ? "bg-secondary text-secondary-foreground"
                : "bg-primary text-primary-foreground",
            )}
          >
            {formatStatus(application.formStatus)}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          #{application.applicationNumber}
          {isDraft ? ` · ${progressPct}% complete` : null}
        </p>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
