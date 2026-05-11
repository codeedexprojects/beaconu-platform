export interface AssociateAdminRole {
  id: string
  name: string
  slug: string
}

export interface AssociateAdminItem {
  id: string
  fullName: string
  email: string
  phoneNumber: string | null
  country: string | null
  agencyName: string | null
  agencyRegNumber: string | null
  status: string
  createdAt: string
  lastLoginAt: string | null
  role: AssociateAdminRole
  employeesCount: number
}

export interface AssociateAdminApprovalResult {
  id: string
  fullName: string
  email: string
  status: string
  updatedAt: string
}