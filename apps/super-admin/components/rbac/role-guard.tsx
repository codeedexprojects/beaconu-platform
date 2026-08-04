"use client";

import { useRbac } from "@/hooks/use-rbac";
import type { Permission } from "@/lib/rbac";

interface RoleGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  permission,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { can } = useRbac();
  return can(permission) ? <>{children}</> : <>{fallback}</>;
}
