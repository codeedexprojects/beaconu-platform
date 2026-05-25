import { api } from "@/lib/api";
import type { PlatformAdmin } from "@beaconu/types";
import type {
  CreatePlatformAdminData,
  UpdatePlatformAdminData,
  UpdatePlatformAdminStatusData,
} from "@beaconu/validation";

export type {
  PlatformAdmin,
  CreatePlatformAdminData,
  UpdatePlatformAdminData,
  UpdatePlatformAdminStatusData,
};

export async function getPlatformAdmins() {
  return api.get<PlatformAdmin[]>("/api/v1/admin/platform-admins");
}

export async function createPlatformAdmin(data: CreatePlatformAdminData) {
  return api.post("/api/v1/admin/platform-admins", data);
}

export async function updatePlatformAdmin(
  id: string,
  data: UpdatePlatformAdminData,
) {
  return api.put(`/api/v1/admin/platform-admins/${id}`, data);
}

export async function updatePlatformAdminStatus(
  id: string,
  data: UpdatePlatformAdminStatusData,
) {
  return api.patch(`/api/v1/admin/platform-admins/${id}/status`, data);
}

export async function deletePlatformAdmin(id: string) {
  return api.delete(`/api/v1/admin/platform-admins/${id}`);
}
