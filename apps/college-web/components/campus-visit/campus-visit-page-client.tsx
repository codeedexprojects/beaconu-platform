"use client";

import { useAuthStore } from "@/store";
import { SignInCta } from "@/components/campus-visit/sign-in-cta";
import { BookingForm } from "@/components/campus-visit/booking-form";

interface CampusVisitPageClientProps {
  collegeId: string;
  subdomain: string;
}

export function CampusVisitPageClient({
  collegeId,
  subdomain,
}: CampusVisitPageClientProps) {
  const student = useAuthStore((s) => s.student);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  if (!hasHydrated) return null;

  if (!student) {
    return (
      <SignInCta
        subdomain={subdomain}
        message="Sign in to request a campus visit."
      />
    );
  }

  return (
    <BookingForm
      collegeId={collegeId}
      subdomain={subdomain}
      student={student}
    />
  );
}
