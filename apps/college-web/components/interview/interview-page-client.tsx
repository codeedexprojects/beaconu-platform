"use client";

import { useAuthStore } from "@/store";
import { SignInCta } from "@/components/campus-visit/sign-in-cta";
import { InterviewRoom } from "@/components/interview/interview-room";

interface InterviewPageClientProps {
  applicationId: string;
  subdomain: string;
}

export function InterviewPageClient({
  applicationId,
  subdomain,
}: InterviewPageClientProps) {
  const student = useAuthStore((s) => s.student);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  if (!hasHydrated) return null;

  if (!student) {
    return (
      <SignInCta
        subdomain={subdomain}
        message="Sign in to book your interview."
      />
    );
  }

  return <InterviewRoom applicationId={applicationId} />;
}
