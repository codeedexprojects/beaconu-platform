import { api } from '@/lib/api'

export interface PlatformRole {
  id: string
  name: string
  slug: string
  isSystemRole: boolean
  isActive: boolean
  permissions: string[]
}

export interface CreatePlatformRolePayload {
  name: string
  slug: string
  permissions: string[]
  is_system_role?: boolean
}

export interface UpdateRolePermissionsPayload {
  permissions: string[]
}

export async function getPlatformRoles(): Promise<PlatformRole[]> {
  return api.get('/api/v1/admin/roles')
}

export async function getPlatformPermissions(): Promise<string[]> {
  return api.get('/api/v1/admin/roles/permissions')
}

export async function createPlatformRole(
  payload: CreatePlatformRolePayload,
): Promise<PlatformRole> {
  return api.post('/api/v1/admin/roles', payload)
}

export async function updatePlatformRolePermissions(
  roleId: string,
  payload: UpdateRolePermissionsPayload,
): Promise<PlatformRole> {
  return api.put(`/api/v1/admin/roles/${roleId}/permissions`, payload)
}
