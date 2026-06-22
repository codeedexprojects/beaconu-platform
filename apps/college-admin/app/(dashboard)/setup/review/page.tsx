"use client";

import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  School,
  MapPin,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  useCollegeCampuses,
  useCollegeCourses,
  useCollegeProfile,
  useSubmitCollegeRegistration,
} from "@/hooks/use-colleges";
import { useAuthStore } from "@/store";
import { getCollegeSlugFromPath, getPortalPath } from "@/lib/portal-path";

export default function SetupReviewPage() {
  const router = useRouter();
  const updateUser = useAuthStore((state) => state.updateUser);
  const collegeSlug =
    typeof window === "undefined"
      ? null
      : getCollegeSlugFromPath(window.location.pathname, window.location.host);

  const { data: profile, isLoading: isProfileLoading } = useCollegeProfile();
  const { data: campuses = [], isLoading: isCampusesLoading } =
    useCollegeCampuses();
  const { data: courses = [], isLoading: isCoursesLoading } =
    useCollegeCourses();
  const { mutate: submitSetup, isPending } = useSubmitCollegeRegistration();

  const isLoading = isProfileLoading || isCampusesLoading || isCoursesLoading;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isReady = profile?.name && campuses.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Review & Submit
          </h2>
          <p className="text-muted-foreground mt-1">
            Review your college information before finalizing the setup. Your
            public landing page will be generated upon submission.
          </p>
        </div>
      </div>

      {!isReady && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold">Incomplete Setup</h4>
            <p className="text-sm opacity-90">
              Please ensure you have filled out your profile and added at least
              one campus before submitting.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Summary */}
        <Card className="col-span-1 lg:col-span-1 border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col hover:border-primary/30 transition-all hover:shadow-lg">
          <div className="bg-primary/5 border-b border-border/50 p-4 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <School className="h-4 w-4 text-primary" /> Profile
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() =>
                router.push(getPortalPath(collegeSlug, "/setup/profile"))
              }
            >
              Edit
            </Button>
          </div>
          <CardContent className="p-6 flex-1">
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">
                  College Name
                </p>
                <p className="font-medium text-base">{profile?.name || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">
                  College Code
                </p>
                <p className="font-medium inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs">
                  {profile?.code || "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">
                  Address
                </p>
                <p className="font-medium leading-relaxed">
                  {[profile?.address, profile?.city, profile?.state]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>
              {profile?.requestedGroupCode && (
                <div className="pt-2 border-t border-border/50 mt-2">
                  <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-1">
                    Joining Group
                  </p>
                  <p className="font-mono text-primary font-bold tracking-wide bg-primary/10 px-2 py-1 rounded inline-block">
                    {profile.requestedGroupCode}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Campuses Summary */}
        <Card className="col-span-1 lg:col-span-1 border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col hover:border-primary/30 transition-all hover:shadow-lg">
          <div className="bg-primary/5 border-b border-border/50 p-4 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Campuses{" "}
              <span className="bg-primary text-primary-foreground rounded-full text-[10px] px-2 py-0.5 ml-1">
                {campuses.length}
              </span>
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() =>
                router.push(getPortalPath(collegeSlug, "/setup/campuses"))
              }
            >
              Edit
            </Button>
          </div>
          <CardContent className="p-6 flex-1">
            {campuses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60 py-8">
                <MapPin className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No campuses added</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {campuses.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between bg-muted/40 border border-border/50 p-3 rounded-lg"
                  >
                    <span className="font-semibold text-sm">{c.name}</span>
                    {c.isMainCampus && (
                      <span className="text-[10px] bg-primary text-primary-foreground font-bold tracking-wider px-2 py-1 rounded-full uppercase">
                        Main
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Academics Summary */}
        <Card className="col-span-1 lg:col-span-1 border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col hover:border-primary/30 transition-all hover:shadow-lg">
          <div className="bg-primary/5 border-b border-border/50 p-4 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Academics{" "}
              <span className="bg-primary text-primary-foreground rounded-full text-[10px] px-2 py-0.5 ml-1">
                {courses.length}
              </span>
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() =>
                router.push(getPortalPath(collegeSlug, "/setup/academics"))
              }
            >
              Edit
            </Button>
          </div>
          <CardContent className="p-0 flex-1 flex flex-col">
            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60 p-6 py-12">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No courses added</p>
                <p className="text-xs text-muted-foreground">
                  You can configure these later.
                </p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-6 space-y-3">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="bg-muted/40 border border-border/50 p-3 rounded-lg"
                  >
                    <p className="font-bold text-sm line-clamp-1">{c.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <span className="bg-background px-1.5 py-0.5 rounded border border-border/50">
                        {c.code}
                      </span>
                      <span>{c.studyLevel?.name}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-10 mt-10">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() =>
            router.push(getPortalPath(collegeSlug, "/setup/academics"))
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Academics
        </Button>
        <Button
          size="lg"
          onClick={() =>
            submitSetup(undefined, {
              onSuccess: (data) => {
                toast.success(
                  "College setup completed successfully! Welcome to your dashboard.",
                );
                updateUser({ collegeStatus: data.status });
                router.push(getPortalPath(collegeSlug, "/"));
              },
            })
          }
          disabled={!isReady || isPending}
          className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 text-md px-8 h-12"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-5 w-5" />
          )}
          Submit & Go Live
        </Button>
      </div>
    </div>
  );
}
