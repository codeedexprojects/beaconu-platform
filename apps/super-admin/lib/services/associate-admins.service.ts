import { api } from "@/lib/api";

export interface AssociateAdmin {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  status: string;
  agencyName: string;
  agencyRegNumber: string;
  country?: string;
  createdAt: string;
}

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
): Promise<any> {
  return api.patch(`/api/v1/admin/users/blink-users/${id}/status`, { status });
}
