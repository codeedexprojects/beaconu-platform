"use client";

import { useAuthStore } from "@/store";
import { SignInCta } from "@/components/campus-visit/sign-in-cta";
import { AssessmentRoom } from "@/components/assessment/assessment-room";

interface AssessmentPageClientProps {
  applicationId: string;
  subdomain: string;
}

export function AssessmentPageClient({
  applicationId,
  subdomain,
}: AssessmentPageClientProps) {
  const student = useAuthStore((s) => s.student);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  if (!hasHydrated) return null;

  if (!student) {
    return (
      <SignInCta
        subdomain={subdomain}
        message="Sign in to access your assessment."
      />
    );
  }

  return <AssessmentRoom applicationId={applicationId} />;
}
