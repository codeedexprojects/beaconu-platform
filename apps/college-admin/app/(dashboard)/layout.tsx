"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, LogOut, CheckCircle2, School } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store";
import { authService } from "@/lib/services/auth.service";
import { collegesService } from "@/lib/services/colleges.service";
import { QUERY_KEYS } from "@/lib/query-keys";
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
  const { user, isAuthenticated, logout } = useAuthStore();
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
      await authService.logout();
    } catch (e) {
      // ignore
    } finally {
      logout();
      router.push(getPortalPath(collegeSlug, "/login"));
    }
  };

  const isPendingSetup = user?.collegeStatus === "pending_setup";
  const currentStepIndex = WIZARD_STEPS.findIndex((s) =>
    appPathname.includes(s.path),
  );
  const isAtRoot = appPathname === "/";

  // Fetch onboarding progress queries (only enabled on root path for pending setup users)
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: () => collegesService.getProfile(),
    enabled: isPendingSetup && isAtRoot,
  });

  const { data: campuses = [], isLoading: isCampusesLoading } = useQuery({
    queryKey: QUERY_KEYS.campuses,
    queryFn: () => collegesService.getCampuses(),
    enabled: isPendingSetup && isAtRoot,
  });

  const { data: courses = [], isLoading: isCoursesLoading } = useQuery({
    queryKey: QUERY_KEYS.courses,
    queryFn: () => collegesService.getCourses(),
    enabled: isPendingSetup && isAtRoot,
  });

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
      logout();
      router.replace(getPortalPath(user.collegeSlug, "/login"));
    }
  }, [collegeSlug, isAuthenticated, isMounted, logout, router, user]);

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
              <p className="text-xs text-muted-foreground mt-1">Admin</p>
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
        {/* Wizard Sidebar (only visible if pending setup or viewing setup pages) */}
        {isPendingSetup && (
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
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
