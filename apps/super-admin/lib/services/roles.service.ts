import { api } from "@/lib/api";
import type { PlatformRole } from "@beaconu/types";
import type {
  CreatePlatformRoleInput,
  UpdateRolePermissionsInput,
} from "@beaconu/validation";

export type { CreatePlatformRoleInput, UpdateRolePermissionsInput };

export async function getPlatformRoles(): Promise<PlatformRole[]> {
  return api.get("/api/v1/admin/roles");
}

export async function getPlatformPermissions(): Promise<string[]> {
  return api.get("/api/v1/admin/roles/permissions");
}

export async function createPlatformRole(
  payload: CreatePlatformRoleInput,
): Promise<PlatformRole> {
  return api.post("/api/v1/admin/roles", payload);
}

export async function updatePlatformRolePermissions(
  roleId: string,
  payload: UpdateRolePermissionsInput,
): Promise<PlatformRole> {
  return api.put(`/api/v1/admin/roles/${roleId}/permissions`, payload);
}
