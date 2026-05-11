import { api } from '@/lib/api'
import type { AdminListItem } from '../types'

export const adminsService = {
  list: () => api.get<AdminListItem[]>('/api/v1/platform-admin/admins'),
  create: (data: any) => api.post<AdminListItem>('/api/v1/platform-admin/admins', data),
}