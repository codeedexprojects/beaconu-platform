import { api } from "@/lib/api";
import type { SubmitCounsellorRequestInput } from "@beaconu/types";

export async function submitCounsellorRequest(
  data: SubmitCounsellorRequestInput,
): Promise<{ id: string; status: string; created_at: string }> {
  return api.post("/api/v1/public/counsellor-requests", data);
}
