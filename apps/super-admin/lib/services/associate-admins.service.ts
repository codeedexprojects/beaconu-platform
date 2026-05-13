import { api } from "@/lib/api";
import type { AssociateAdmin } from "@beaconu/types";

export type { AssociateAdmin };

export async function getAssociateAdmins(): Promise<AssociateAdmin[]> {
  return api.get("/api/v1/blink/associate");
}

export async function updateAssociateStatus(
  id: string,
  status: string,
): Promise<AssociateAdmin> {
  return api.patch(`/api/v1/blink/associate/employees/${id}/status`, {
    status,
  });
}

export async function approveEmployee(
  id: string,
  status: string,
): Promise<unknown> {
  return api.patch(`/api/v1/admin/users/blink-users/${id}/status`, { status });
}
