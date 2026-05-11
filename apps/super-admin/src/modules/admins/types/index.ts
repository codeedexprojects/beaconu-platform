export interface AdminRoleSummary {
  id: string
  name: string
  slug: string
  isSystemRole: boolean
  isActive: boolean
}

export interface AdminListItem {
  id: string
  fullName: string
  email: string
  avatarUrl: string | null
  status: string
  lastLoginAt: string | null
  createdAt: string
  role: AdminRoleSummary | null
}