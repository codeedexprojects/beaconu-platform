import { API_BASE_URL } from "@/lib/constants";

export interface ReferralCodeResolution {
  isValid: boolean;
  collegeSlug: string;
  collegeName: string;
  courseId: string | null;
  courseName: string | null;
}

/**
 * Fires the public referral-click ping. Uses a plain fetch (not the
 * authenticated api client) since this runs pre-login on the landing page.
 */
export async function trackReferralClick(
  code: string,
): Promise<ReferralCodeResolution | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/public/referrals/${encodeURIComponent(code)}`,
    );
    if (!res.ok) return null;
    const body = await res.json();
    return body?.data ?? null;
  } catch {
    return null;
  }
}
