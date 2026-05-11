import { api } from '@/lib/api'
import type {
  CreatePlatformRolePayload,
  PlatformPermission,
  PlatformProfilesResponse,
  PlatformRole,
  UpdateRolePermissionsPayload,
} from '../types'

const PLATFORM_ADMIN_BASE = '/api/v1/platform-admin'

export const platformService = {
  getProfiles: () => api.get<PlatformProfilesResponse>(`${PLATFORM_ADMIN_BASE}/profiles`),
  getRoles: () => api.get<PlatformRole[]>(`${PLATFORM_ADMIN_BASE}/roles`),
  getPermissions: () => api.get<PlatformPermission[]>(`${PLATFORM_ADMIN_BASE}/roles/permissions`),
  createRole: (body: CreatePlatformRolePayload) =>
    api.post<PlatformRole>(`${PLATFORM_ADMIN_BASE}/roles`, body),
  updateRolePermissions: (roleId: string, body: UpdateRolePermissionsPayload) =>
    api.put<PlatformRole>(`${PLATFORM_ADMIN_BASE}/roles/${roleId}/permissions`, body),
}
