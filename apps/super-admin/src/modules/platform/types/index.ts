export interface PlatformStudentProfile {
  id: string
  fullName: string
  email: string | null
  phoneNumber: string | null
  status: string
  createdAt: string
}

export interface PlatformBlinkUserProfile {
  id: string
  fullName: string
  email: string
  phoneNumber: string | null
  status: string
  agencyName: string | null
  createdAt: string
}

export interface PlatformProfilesResponse {
  students: PlatformStudentProfile[]
  blinkUsers: PlatformBlinkUserProfile[]
}

export interface PlatformRole {
  id: string
  name: string
  slug: string
  isSystemRole: boolean
  isActive: boolean
  permissions: string[]
}

export type PlatformPermission = string

export interface CreatePlatformRolePayload {
  name: string
  slug: string
  permissions: string[]
  is_system_role?: boolean
}

export interface UpdateRolePermissionsPayload {
  permissions: string[]
}
