"use client";

import { useAuthStore } from "@/store";
import { SignInCta } from "@/components/campus-visit/sign-in-cta";
import { ApplicationDetailsSections } from "@/components/applications/application-details-sections";

interface ApplicationDetailsPageClientProps {
  applicationId: string;
  subdomain: string;
}

export function ApplicationDetailsPageClient({
  applicationId,
  subdomain,
}: ApplicationDetailsPageClientProps) {
  const student = useAuthStore((s) => s.student);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  if (!hasHydrated) return null;

  if (!student) {
    return (
      <SignInCta
        subdomain={subdomain}
        message="Sign in to fill in your application details."
      />
    );
  }

  return <ApplicationDetailsSections applicationId={applicationId} />;
}
