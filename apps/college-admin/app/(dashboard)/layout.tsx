"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Loader2,
  LogOut,
  CheckCircle2,
  School,
  MapPin,
  BookOpen,
  Shield,
  Users,
  Home,
  Truck,
  Settings,
  LayoutDashboard,
  Star,
  Library,
  CalendarDays,
  Percent,
  FileText,
  ShieldAlert,
  ClipboardList,
  Mic,
} from "lucide-react";
import { useAuthStore } from "@/store";
import {
  useCollegeCampuses,
  useCollegeCourses,
  useCollegeProfile,
} from "@/hooks/use-colleges";
import { useLogoutCollegeAdmin } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { getCollegeSlugFromPath, getPortalPath } from "@/lib/portal-path";
import { Bell, HelpCircle } from "lucide-react";

const WIZARD_STEPS = [
  { id: "profile", name: "College Profile", path: "/setup/profile" },
  { id: "campuses", name: "Campuses", path: "/setup/campuses" },
  { id: "academics", name: "Academics", path: "/setup/academics" },
  { id: "review", name: "Review & Submit", path: "/setup/review" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.token !== null);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { mutateAsync: logoutCollegeAdmin } = useLogoutCollegeAdmin();
  const [isMounted, setIsMounted] = useState(false);
  const collegeSlug =
    typeof window === "undefined"
      ? getCollegeSlugFromPath(pathname)
      : getCollegeSlugFromPath(pathname, window.location.host);
  const slugPrefix = collegeSlug ? `/${collegeSlug}` : null;
  const appPathname = slugPrefix
    ? pathname === slugPrefix
      ? "/"
      : pathname.startsWith(`${slugPrefix}/`)
        ? pathname.slice(slugPrefix.length)
        : pathname
    : pathname;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutCollegeAdmin();
    } catch {
      // ignore
    } finally {
      clearAuth();
      router.push(getPortalPath(collegeSlug, "/login"));
    }
  };

  const isPendingSetup = user?.collegeStatus === "pending_setup";
  const currentStepIndex = WIZARD_STEPS.findIndex((s) =>
    appPathname.includes(s.path),
  );
  const isAtRoot = appPathname === "/";

  // Fetch onboarding progress queries (only enabled on root path for pending setup users)
  const { data: profile, isLoading: isProfileLoading } = useCollegeProfile(
    isPendingSetup && isAtRoot,
  );

  const { data: campuses = [], isLoading: isCampusesLoading } =
    useCollegeCampuses(isPendingSetup && isAtRoot);

  const { data: courses = [], isLoading: isCoursesLoading } = useCollegeCourses(
    isPendingSetup && isAtRoot,
  );

  const isLoadingSetupData =
    isPendingSetup &&
    isAtRoot &&
    (isProfileLoading || isCampusesLoading || isCoursesLoading);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push(getPortalPath(collegeSlug, "/login"));
    }
  }, [collegeSlug, isAuthenticated, isMounted, router]);

  useEffect(() => {
    if (!isMounted || !isAuthenticated || !user || !collegeSlug) return;

    if (user.collegeSlug !== collegeSlug) {
      clearAuth();
      router.replace(getPortalPath(user.collegeSlug, "/login"));
    }
  }, [collegeSlug, isAuthenticated, isMounted, clearAuth, router, user]);

  // If pending setup and at root, redirect to the correct setup stage based on saved progress
  useEffect(() => {
    if (
      isMounted &&
      isPendingSetup &&
      isAtRoot &&
      !isProfileLoading &&
      !isCampusesLoading &&
      !isCoursesLoading
    ) {
      // 1. Profile incomplete check
      const isProfileComplete = !!(
        profile?.name &&
        profile?.code &&
        profile?.address &&
        profile?.city &&
        profile?.state &&
        profile?.district &&
        profile?.pinCode
      );

      if (!isProfileComplete) {
        router.replace(getPortalPath(collegeSlug, "/setup/profile"));
        return;
      }

      // 2. Campuses incomplete check
      const hasCampuses = campuses && campuses.length > 0;
      if (!hasCampuses) {
        router.replace(getPortalPath(collegeSlug, "/setup/campuses"));
        return;
      }

      // 3. Academics incomplete check
      const hasCourses = courses && courses.length > 0;
      if (!hasCourses) {
        router.replace(getPortalPath(collegeSlug, "/setup/academics"));
        return;
      }

      // 4. Default to review step
      router.replace(getPortalPath(collegeSlug, "/setup/review"));
    }
  }, [
    collegeSlug,
    isMounted,
    isAtRoot,
    isPendingSetup,
    router,
    profile,
    campuses,
    courses,
    isProfileLoading,
    isCampusesLoading,
    isCoursesLoading,
  ]);

  if (!isMounted || !isAuthenticated || !user || isLoadingSetupData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasPermission = (permission?: string) => {
    if (!user) return false;
    if (user.roleSlug === "college_admin") return true;
    if (!permission) return true;
    return user.permissions?.includes(permission) ?? false;
  };

  const getRequiredPermissionForPath = (path: string): string | null => {
    if (path.includes("/setup/profile")) return "profile.view";
    if (path.includes("/setup/campuses")) return "campuses.view";
    if (path.includes("/setup/academics")) return "academics.view";
    if (path.includes("/quotas")) return "academics.view";
    if (path.includes("/roles")) return "staff.view";
    if (path.includes("/staff")) return "staff.view";
    if (path.includes("/hostels")) return "hostel.view";
    if (path.includes("/libraries")) return "library.view";
    if (path.includes("/commute")) return "commute.view";
    if (path.includes("/settings")) return "profile.view";
    if (path.includes("/ambassadors")) return "staff.view";
    if (path.includes("/campus-visits")) return "staff.view";
    if (path.includes("/documents")) return "staff.view";
    if (path.includes("/anti-ragging")) return "staff.view";
    return null;
  };

  const requiredPermission = getRequiredPermissionForPath(appPathname);
  const hasAccess = !requiredPermission || hasPermission(requiredPermission);

  const getRoleDisplayName = (slug: string) => {
    switch (slug) {
      case "college_admin":
        return "College Admin";
      case "hostel_admin":
        return "Hostel Admin";
      case "commute_admin":
        return "Commute Admin";
      case "sub_admin":
        return "Sub Admin";
      default:
        return slug
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
    }
  };

  const renderAccessDenied = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-background rounded-2xl border border-destructive/15 shadow-xl backdrop-blur-md max-w-lg mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
        <Shield className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
        Access Denied
      </h2>
      <p className="text-muted-foreground text-sm max-w-sm mb-6 leading-relaxed">
        You do not have the required permission (
        <strong>{requiredPermission}</strong>) to access this dashboard feature.
        Please contact your college administrator to grant you access.
      </p>
      <Button
        onClick={() => router.push(getPortalPath(collegeSlug, "/"))}
        className="px-6 py-2 shadow-lg"
      >
        Return to Portal Home
      </Button>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-cream">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Onboarding Wizard or Active console dashboard navigation) */}
        {!isPendingSetup ? (
          <aside className="w-72 flex flex-col shrink-0 border-r border-transparent bg-navy hidden md:flex h-screen sticky top-0">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center gap-3 px-5 border-b border-navy-dark/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white">
                <School className="h-5 w-5 text-navy-dark" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold text-white font-serif tracking-wide truncate max-w-[180px]">
                  {user.collegeName}
                </span>
                <span className="text-[10px] text-gray-sidebar uppercase tracking-widest mt-1">
                  College Admin
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="font-semibold text-[10px] uppercase tracking-widest text-gray-sidebar mb-4 px-2">
                Active Console
              </h2>
              <nav className="space-y-1">
                {[
                  {
                    name: "Dashboard",
                    path: "/",
                    icon: LayoutDashboard,
                    permission: undefined,
                  },
                  {
                    name: "Overview Profile",
                    path: "/setup/profile",
                    icon: School,
                    permission: "profile.view",
                  },
                  {
                    name: "Campuses Catalog",
                    path: "/setup/campuses",
                    icon: MapPin,
                    permission: "campuses.view",
                  },
                  {
                    name: "Academics Catalog",
                    path: "/setup/academics",
                    icon: BookOpen,
                    permission: "academics.view",
                  },
                  {
                    name: "Quota Catalogue",
                    path: "/quotas",
                    icon: Percent,
                    permission: "academics.view",
                  },
                  {
                    name: "Role Builder (RBAC)",
                    path: "/roles",
                    icon: Shield,
                    permission: "staff.view",
                  },
                  {
                    name: "Staff Directory",
                    path: "/staff",
                    icon: Users,
                    permission: "staff.view",
                  },
                  {
                    name: "Hostels Occupancy",
                    path: "/hostels",
                    icon: Home,
                    permission: "hostel.view",
                  },
                  {
                    name: "Libraries",
                    path: "/libraries",
                    icon: Library,
                    permission: "library.view",
                  },
                  {
                    name: "Bus Fleet & Commute",
                    path: "/commute",
                    icon: Truck,
                    permission: "commute.view",
                  },
                  {
                    name: "Campus Ambassadors",
                    path: "/ambassadors",
                    icon: Star,
                    permission: "staff.view",
                  },
                  {
                    name: "Campus Visits",
                    path: "/campus-visits",
                    icon: CalendarDays,
                    permission: "staff.view",
                  },
                  {
                    name: "Documents",
                    path: "/documents",
                    icon: FileText,
                    permission: "staff.view",
                  },
                  {
                    name: "Application Forms",
                    path: "/application-forms",
                    icon: ClipboardList,
                    permission: "staff.view",
                  },
                  {
                    name: "Anti-Ragging",
                    path: "/anti-ragging",
                    icon: ShieldAlert,
                    permission: "staff.view",
                  },
                  {
                    name: "Assessments",
                    path: "/assessments",
                    icon: Mic,
                    permission: "staff.view",
                  },
                  {
                    name: "Settings",
                    path: "/settings",
                    icon: Settings,
                    permission: "profile.view",
                  },
                ]
                  .filter((item) => hasPermission(item.permission))
                  .map((item) => {
                    const Icon = item.icon;
                    // Dashboard root "/" only active at exact root; others active when path starts with the item path
                    const isActive =
                      item.path === "/"
                        ? appPathname === "/"
                        : appPathname === item.path ||
                          appPathname.startsWith(`${item.path}/`);
                    return (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() =>
                          router.push(getPortalPath(collegeSlug, item.path))
                        }
                        className={`group flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-out ${
                          isActive
                            ? "bg-gold text-white"
                            : "text-gray-sidebar hover:bg-navy-dark hover:text-white"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-gray-sidebar group-hover:text-white"}`}
                        />
                        {item.name}
                      </button>
                    );
                  })}
              </nav>
            </div>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-navy-dark/50 mt-auto">
              <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-navy-dark">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-dark bg-navy-dark text-xs text-white uppercase font-medium">
                  {user.fullName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-sm font-medium text-white truncate">
                    {user.fullName}
                  </span>
                  <span className="text-[11px] text-gray-sidebar truncate">
                    {getRoleDisplayName(user.roleSlug)}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-gray-sidebar hover:text-white rounded-md hover:bg-navy transition-colors"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        ) : (
          <aside className="w-72 flex flex-col shrink-0 border-r border-transparent bg-navy hidden md:flex h-screen sticky top-0">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center gap-3 px-5 border-b border-navy-dark/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white">
                <School className="h-5 w-5 text-navy-dark" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold text-white font-serif tracking-wide truncate max-w-[180px]">
                  {user.collegeName}
                </span>
                <span className="text-[10px] text-gray-sidebar uppercase tracking-widest mt-1">
                  Setup
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="font-semibold text-[10px] uppercase tracking-widest text-gray-sidebar mb-6 px-2">
                Onboarding Setup
              </h2>
              <nav className="space-y-4 relative px-2">
                <div className="absolute left-[1.1rem] top-2 bottom-6 w-[2px] bg-navy-dark z-0"></div>
                {WIZARD_STEPS.map((step, index) => {
                  const isActive = index === currentStepIndex;
                  const isPast = index < currentStepIndex;

                  return (
                    <div
                      key={step.id}
                      className="flex items-start gap-4 relative z-10"
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[2px] text-xs font-medium transition-colors ${
                          isPast
                            ? "border-success bg-success text-white"
                            : isActive
                              ? "border-gold bg-gold text-white"
                              : "border-gray-sidebar/30 bg-navy text-gray-sidebar"
                        }`}
                      >
                        {isPast ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="pt-1">
                        <p
                          className={`text-sm font-medium ${
                            isActive || isPast
                              ? "text-white"
                              : "text-gray-sidebar"
                          }`}
                        >
                          {step.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-navy-dark/50 mt-auto">
              <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-navy-dark">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-dark bg-navy-dark text-xs text-white uppercase font-medium">
                  {user.fullName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-sm font-medium text-white truncate">
                    {user.fullName}
                  </span>
                  <span className="text-[11px] text-gray-sidebar truncate">
                    {getRoleDisplayName(user.roleSlug)}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-gray-sidebar hover:text-white rounded-md hover:bg-navy transition-colors"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Mobile Wizard Nav */}
        {isPendingSetup && (
          <div className="md:hidden w-full bg-white border-b p-4 flex items-center justify-between shadow-soft">
            {WIZARD_STEPS.map((step, index) => {
              if (index === currentStepIndex) {
                return (
                  <div
                    key={step.id}
                    className="flex items-center gap-2 font-medium text-sm text-navy-dark"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-white text-xs">
                      {index + 1}
                    </span>
                    {step.name}
                  </div>
                );
              }
              return null;
            })}
            <div className="text-xs text-gray-label">
              Step {currentStepIndex + 1} of {WIZARD_STEPS.length}
            </div>
          </div>
        )}

        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Navbar */}
          <header className="sticky top-0 z-40 border-b border-border bg-cream/90 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center text-sm font-medium text-gray-label">
                <span className="hover:text-navy-dark transition-colors cursor-pointer">
                  Dashboard
                </span>
                <span className="mx-2">/</span>
                <span className="text-navy-dark">
                  {WIZARD_STEPS.find((s) => appPathname.includes(s.path))
                    ?.name ||
                    [
                      { name: "Overview Profile", path: "/setup/profile" },
                      { name: "Campuses Catalog", path: "/setup/campuses" },
                      { name: "Academics Catalog", path: "/setup/academics" },
                      { name: "Quota Catalogue", path: "/quotas" },
                      { name: "Role Builder (RBAC)", path: "/roles" },
                      { name: "Staff Directory", path: "/staff" },
                      { name: "Hostels Occupancy", path: "/hostels" },
                      { name: "Libraries", path: "/libraries" },
                      { name: "Bus Fleet & Commute", path: "/commute" },
                      { name: "Campus Ambassadors", path: "/ambassadors" },
                      { name: "Campus Visits", path: "/campus-visits" },
                      { name: "Documents", path: "/documents" },
                      { name: "Application Forms", path: "/application-forms" },
                      { name: "Anti-Ragging", path: "/anti-ragging" },
                      { name: "Assessments", path: "/assessments" },
                      { name: "Settings", path: "/settings" },
                    ].find((s) => appPathname.includes(s.path))?.name ||
                    "Overview"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-9 w-9 border-border text-gray-label hover:text-navy-dark hover:bg-white bg-white"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-9 w-9 border-border text-gray-label hover:text-navy-dark hover:bg-white relative bg-white"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-gold border-2 border-white"></span>
                </Button>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 lg:p-8">
            {hasAccess ? children : renderAccessDenied()}
          </div>
        </main>
      </div>

      {/* Global CSS overrides to position the user profile footer correctly when sidebar is sticky, since we changed the structure slightly */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        aside > div:last-child { margin-bottom: 0; }
      `,
        }}
      />
    </div>
  );
}
