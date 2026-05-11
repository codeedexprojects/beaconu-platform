import { api } from '@/lib/api'
import type { AssociateAdminApprovalResult, AssociateAdminItem } from '../types'

export const associateAdminsService = {
  list: () => api.get<AssociateAdminItem[]>('/api/v1/platform-admin/associate-admins'),
  updateStatus: (associateAdminId: string, status: string) =>
    api.put<AssociateAdminApprovalResult>(
      `/api/v1/platform-admin/associate-admins/${associateAdminId}/status`,
      { status },
    ),
}