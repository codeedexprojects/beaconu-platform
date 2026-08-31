"use client";

import { useAuthStore } from "@/store";
import { SignInCta } from "@/components/campus-visit/sign-in-cta";
import { StartApplicationForm } from "@/components/applications/start-application-form";

interface NewApplicationPageClientProps {
  cycleId?: string;
  collegeId: string;
  subdomain: string;
}

export function NewApplicationPageClient({
  cycleId,
  collegeId,
  subdomain,
}: NewApplicationPageClientProps) {
  const student = useAuthStore((s) => s.student);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  if (!hasHydrated) return null;

  if (!student) {
    return (
      <SignInCta
        subdomain={subdomain}
        message="Sign in to start your application."
      />
    );
  }

  return (
    <StartApplicationForm
      cycleId={cycleId}
      collegeId={collegeId}
      subdomain={subdomain}
    />
  );
}
