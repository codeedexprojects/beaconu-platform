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
    <div className="flex h-full items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3 text-center max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <ShieldOff className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">No Permission</p>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
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
    <div className="relative flex h-screen overflow-hidden bg-white text-[#1e293b]">
      {/* Background ambient glowing blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#fafafa]">
        {/* Top-right glowing blob */}
        <div className="absolute -top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[130px] animate-pulse duration-[8000ms]" />
        {/* Left middle glowing blob */}
        <div className="absolute top-[20%] -left-[10%] h-[700px] w-[700px] rounded-full bg-[#ffedd5]/25 blur-[150px]" />
        {/* Bottom-right glowing blob */}
        <div className="absolute -bottom-[20%] right-[20%] h-[500px] w-[500px] rounded-full bg-[#f0fdf4]/30 blur-[120px]" />
      </div>

      {/* Subtle Dot-grid texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #0f172a 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Main dashboard content container */}
      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto relative z-10">
            {hasPermission ? children : <NoPermissionView />}
          </main>
        </div>
      </div>
    </div>
  );
}
