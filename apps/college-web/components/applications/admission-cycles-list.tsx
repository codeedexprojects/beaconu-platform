"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { useAuthStore } from "@/store";
import { SignInCta } from "@/components/campus-visit/sign-in-cta";
import { ApplicationProgressCard } from "@/components/applications/application-progress-card";
import { useAdmissionCycles, useMyApplications } from "@/hooks/use-application";
import { getErrorMessage } from "@/lib/api";

interface AdmissionCyclesListProps {
  collegeId: string;
  subdomain: string;
}

export function AdmissionCyclesList({
  collegeId,
  subdomain,
}: AdmissionCyclesListProps) {
  const student = useAuthStore((s) => s.student);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const enabled = hasHydrated && student !== null;
  const {
    data: cycles,
    isLoading,
    error,
  } = useAdmissionCycles(collegeId, enabled);
  const { data: myApplications } = useMyApplications(enabled);

  if (!hasHydrated) return null;

  if (!student) {
    return (
      <SignInCta
        subdomain={subdomain}
        message="Sign in to start your application."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border bg-muted"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{getErrorMessage(error)}</p>;
  }

  const openCycles = (cycles ?? []).filter((c) => c.status === "open");
  const collegeApplications = (myApplications ?? []).filter(
    (a) => a.collegeSlug === subdomain,
  );

  return (
    <div className="space-y-8">
      {openCycles.length > 0 ? (
        <Link
          href={`/college/${subdomain}/applications/new`}
          className="flex items-center justify-between rounded-2xl bg-headerTeal-dark p-5 text-white transition-opacity hover:opacity-90"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">Start New Application</p>
              <p className="mt-0.5 text-sm text-white/80">
                Apply for courses and track your admission progress
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0" />
        </Link>
      ) : (
        <p className="rounded-2xl bg-field p-5 text-sm text-muted-foreground">
          There are no admission cycles open right now. Check back soon.
        </p>
      )}

      {collegeApplications.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-headerTeal">
            Your Applications
          </h2>
          {collegeApplications.map((application) => (
            <ApplicationProgressCard
              key={application.id}
              application={application}
              subdomain={subdomain}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
