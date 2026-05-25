import { useAuthStore } from "@/store";
import { can, canAny, type AdminRole, type Permission } from "@/lib/rbac";

export function useRbac() {
  const admin = useAuthStore((s) => s.admin);
  const permissions = admin?.permissions ?? [];
  const isSuperAdmin =
    admin?.role === "super_admin" || permissions.includes("*");

  return {
    role: admin?.role,
    permissions,
    can: (permission: string) =>
      isSuperAdmin || permissions.includes(permission),
    canAny: (required: string[]) =>
      isSuperAdmin || required.some((p) => permissions.includes(p)),
    isSuperAdmin,
  };
}
