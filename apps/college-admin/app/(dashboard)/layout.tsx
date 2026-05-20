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
    if (path.includes("/roles")) return "staff.view";
    if (path.includes("/staff")) return "staff.view";
    if (path.includes("/hostels")) return "hostel.view";
    if (path.includes("/commute")) return "commute.view";
    if (path.includes("/settings")) return "profile.view";
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
    <div className="flex min-h-screen flex-col bg-muted/20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b bg-background shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <School className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block tracking-tight">
              {user.collegeName}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">
                {user.fullName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {getRoleDisplayName(user.roleSlug)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Onboarding Wizard or Active console dashboard navigation) */}
        {!isPendingSetup ? (
          <aside className="w-64 shrink-0 border-r bg-card hidden md:block">
            <div className="p-6">
              <h2 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-6">
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
                    name: "Bus Fleet & Commute",
                    path: "/commute",
                    icon: Truck,
                    permission: "commute.view",
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
                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </button>
                    );
                  })}
              </nav>
            </div>
          </aside>
        ) : (
          <aside className="w-64 shrink-0 border-r bg-card hidden md:block">
            <div className="p-6">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-6">
                Onboarding Setup
              </h2>
              <nav className="space-y-4 relative">
                <div className="absolute left-3.5 top-2 bottom-6 w-0.5 bg-muted z-0"></div>
                {WIZARD_STEPS.map((step, index) => {
                  const isActive = index === currentStepIndex;
                  const isPast = index < currentStepIndex;

                  return (
                    <div
                      key={step.id}
                      className="flex items-start gap-4 relative z-10"
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors ${
                          isPast
                            ? "border-primary bg-primary text-primary-foreground"
                            : isActive
                              ? "border-primary bg-background text-primary"
                              : "border-muted-foreground/30 bg-background text-muted-foreground"
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
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground"
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
          </aside>
        )}

        {/* Mobile Wizard Nav (only visible if pending setup) */}
        {isPendingSetup && (
          <div className="md:hidden w-full bg-card border-b p-4 flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => {
              if (index === currentStepIndex) {
                return (
                  <div
                    key={step.id}
                    className="flex items-center gap-2 font-medium text-sm"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                      {index + 1}
                    </span>
                    {step.name}
                  </div>
                );
              }
              return null;
            })}
            <div className="text-xs text-muted-foreground">
              Step {currentStepIndex + 1} of {WIZARD_STEPS.length}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl">
            {hasAccess ? children : renderAccessDenied()}
          </div>
        </main>
      </div>
    </div>
  );
}
