import { API_BASE } from "@/lib/constants";

/** Never throws: a down API must still render the store buttons and the code. */
export async function validateInviteCode(code: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/public/invite/${encodeURIComponent(code)}`,
      { cache: "no-store" },
    );
    return res.ok;
  } catch {
    return false;
  }
}
