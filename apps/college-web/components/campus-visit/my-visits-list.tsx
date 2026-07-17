"use client";

import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store";
import { useMyCampusVisits } from "@/hooks/use-campus-visits";
import { SignInCta } from "@/components/campus-visit/sign-in-cta";
import { VisitCard } from "@/components/campus-visit/visit-card";

interface MyVisitsListProps {
  collegeId: string;
  subdomain: string;
}

export function MyVisitsList({ collegeId, subdomain }: MyVisitsListProps) {
  const student = useAuthStore((s) => s.student);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const { data, isLoading } = useMyCampusVisits(collegeId, Boolean(student));

  if (!hasHydrated) return null;

  if (!student) {
    return (
      <SignInCta
        subdomain={subdomain}
        message="Sign in to see your campus visits."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const visits = data?.visits ?? [];

  if (visits.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        You haven&apos;t requested any campus visits yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {visits.map((visit) => (
        <VisitCard key={visit.id} visit={visit} collegeId={collegeId} />
      ))}
    </div>
  );
}
