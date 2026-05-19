"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/store";
import { useRbac } from "@/hooks/use-rbac";
import { ShieldOff } from "lucide-react";

// Routes that require a specific permission to access
const ROUTE_PERMISSIONS: Record<string, string> = {
  "/platform-admins": "platform.admins.view",
  "/roles": "platform.roles.view",
  "/settings": "platform.settings.view",
  "/blink/requests": "platform.admins.manage",
  "/blink/users": "platform.admins.view",
  "/universities": "universities.view",
  "/university-types": "university-types.view",
  "/colleges": "colleges.view",
  "/students": "students.view",
  "/student-leads": "leads.view",
  "/leads": "leads.view",
  "/counsellors": "counsellors.view",
  "/blogs": "content.view",
  "/articles": "content.view",
  "/news-alerts": "content.view",
  "/entrance-exams": "exams.view",
  "/events": "events.view",
};

function NoPermissionView() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ShieldOff className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No Permission</p>
          <p className="mt-1 text-xs text-muted-foreground">
            You don&apos;t have access to this section. Contact your
            administrator to request access.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { can } = useRbac();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const isAuthenticated = token !== null;

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, hasHydrated, router]);

  const hasPermission = useMemo(() => {
    const requiredPermission = Object.entries(ROUTE_PERMISSIONS).find(
      ([route]) => pathname.startsWith(route),
    )?.[1];
    if (!requiredPermission) return true;
    return can(requiredPermission);
  }, [pathname, can]);

  if (!hasHydrated || !isAuthenticated) return <></>;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {hasPermission ? children : <NoPermissionView />}
        </main>
      </div>
    </div>
  );
}
