import { api } from "@/lib/api";
import type { PlatformConfig } from "@beaconu/types";
import type { UpdatePlatformConfigInput } from "@beaconu/validation";

export type { UpdatePlatformConfigInput };

export async function getPlatformConfig(): Promise<PlatformConfig> {
  return api.get("/api/v1/admin/config");
}

export async function updatePlatformConfig(
  payload: UpdatePlatformConfigInput,
): Promise<PlatformConfig> {
  return api.patch("/api/v1/admin/config", payload);
}
