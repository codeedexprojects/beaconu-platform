"use client";

import { useAuthStore } from "@/store";
import { SignInCta } from "@/components/campus-visit/sign-in-cta";
import { ApplicationStatusTimeline } from "@/components/applications/application-status-timeline";

interface ApplicationStatusPageClientProps {
  applicationId: string;
  subdomain: string;
  collegeId: string;
}

export function ApplicationStatusPageClient({
  applicationId,
  subdomain,
  collegeId,
}: ApplicationStatusPageClientProps) {
  const student = useAuthStore((s) => s.student);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  if (!hasHydrated) return null;

  if (!student) {
    return (
      <SignInCta
        subdomain={subdomain}
        message="Sign in to view your application status."
      />
    );
  }

  return (
    <ApplicationStatusTimeline
      applicationId={applicationId}
      subdomain={subdomain}
      collegeId={collegeId}
    />
  );
}
