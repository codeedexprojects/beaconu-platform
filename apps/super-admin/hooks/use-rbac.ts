import { useAuthStore } from "@/store";
import { can, canAny, type AdminRole, type Permission } from "@/lib/rbac";

export function useRbac() {
  // AdminProfile.role is string; cast to AdminRole since the service always sets a known role.
  const role = useAuthStore((s) => s.admin?.role) as AdminRole | undefined;

  return {
    role,
    can: (permission: Permission) => (role ? can(role, permission) : false),
    canAny: (permissions: Permission[]) =>
      role ? canAny(role, permissions) : false,
    isSuperAdmin: role === "super_admin",
  };
}
