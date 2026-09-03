"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { trackReferralClick } from "@/lib/services/referral.service";

function ReferralClickTrackerInner() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const firedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!ref || firedFor.current === ref) return;
    firedFor.current = ref;
    void trackReferralClick(ref);
  }, [ref]);

  return null;
}

export function ReferralClickTracker() {
  return (
    <Suspense fallback={null}>
      <ReferralClickTrackerInner />
    </Suspense>
  );
}
