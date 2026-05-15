import { api } from "@/lib/api";
import type {
  CreatePlatformPermissionInput,
  UpdatePlatformPermissionInput,
} from "@beaconu/validation";

export interface PlatformPermission {
  id: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getPlatformPermissions(): Promise<PlatformPermission[]> {
  return api.get("/api/v1/admin/permissions");
}

export async function createPlatformPermission(
  payload: CreatePlatformPermissionInput,
): Promise<PlatformPermission> {
  return api.post("/api/v1/admin/permissions", payload);
}

export async function updatePlatformPermission(
  id: string,
  payload: UpdatePlatformPermissionInput,
): Promise<PlatformPermission> {
  return api.put(`/api/v1/admin/permissions/${id}`, payload);
}

export async function deletePlatformPermission(id: string): Promise<void> {
  return api.delete(`/api/v1/admin/permissions/${id}`);
}
