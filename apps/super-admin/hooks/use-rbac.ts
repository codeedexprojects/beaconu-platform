import { useAuthStore } from '@/store'
import { can, canAny, type Permission } from '@/lib/rbac'

export function useRbac() {
  const role = useAuthStore((s) => s.admin?.role)

  return {
    role,
    can: (permission: Permission) => (role ? can(role, permission) : false),
    canAny: (permissions: Permission[]) => (role ? canAny(role, permissions) : false),
    isSuperAdmin: role === 'super_admin',
  }
}
