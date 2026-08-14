import { api } from "@/lib/api";
import type { SidebarHintsDto } from "@beaconu/types";

export async function getSidebarHints(): Promise<SidebarHintsDto> {
  return api.get("/api/v1/college-admin/dashboard/sidebar-hints");
}
