"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { collegesService } from "@/lib/services/colleges.service";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useAuthStore } from "@/store";
import { getErrorMessage } from "@/lib/api";
import { getCollegeSlugFromPath, getPortalPath } from "@/lib/portal-path";

export default function SetupReviewPage() {
  const router = useRouter();
  const updateUser = useAuthStore((state) => state.updateUser);
  const collegeSlug =
    typeof window === "undefined"
      ? null
      : getCollegeSlugFromPath(window.location.pathname, window.location.host);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: () => collegesService.getProfile(),
  });

  const { data: campuses = [], isLoading: isCampusesLoading } = useQuery({
    queryKey: QUERY_KEYS.campuses,
    queryFn: () => collegesService.getCampuses(),
  });

  const { data: courses = [], isLoading: isCoursesLoading } = useQuery({
    queryKey: QUERY_KEYS.courses,
    queryFn: () => collegesService.getCourses(),
  });

  const { mutate: submitSetup, isPending } = useMutation({
    mutationFn: () => collegesService.submitRegistration(),
    onSuccess: (data) => {
      toast.success("College setup completed successfully!");
      // Update local state to reflect active status
      updateUser({ collegeStatus: data.status });
      // Redirect to dashboard
      router.push(getPortalPath(collegeSlug, "/"));
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

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
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4 border-b">
          <CardTitle>Review & Submit</CardTitle>
          <CardDescription>
            Review your college information before finalizing the setup. Once
            submitted, your public landing page will go live.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center justify-between border-b pb-2">
              Profile Summary
              <Button
                variant="link"
                size="sm"
                onClick={() =>
                  router.push(getPortalPath(collegeSlug, "/setup/profile"))
                }
              >
                Edit
              </Button>
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">College Name:</span>
              <span className="font-medium">{profile?.name || "—"}</span>

              <span className="text-muted-foreground">College Code:</span>
              <span className="font-medium">{profile?.code || "—"}</span>

              <span className="text-muted-foreground">Address:</span>
              <span className="font-medium">
                {[profile?.address, profile?.city, profile?.state]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center justify-between border-b pb-2">
              Campuses ({campuses.length})
              <Button
                variant="link"
                size="sm"
                onClick={() =>
                  router.push(getPortalPath(collegeSlug, "/setup/campuses"))
                }
              >
                Edit
              </Button>
            </h3>
            {campuses.length === 0 ? (
              <p className="text-sm text-destructive">
                You must add at least one campus.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {campuses.map((c: any) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between bg-muted/20 p-2 rounded"
                  >
                    <span>{c.name}</span>
                    {c.isMainCampus && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Main
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center justify-between border-b pb-2">
              Academic Programs ({courses.length})
              <Button
                variant="link"
                size="sm"
                onClick={() =>
                  router.push(getPortalPath(collegeSlug, "/setup/academics"))
                }
              >
                Edit
              </Button>
            </h3>
            {courses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No courses added yet. You can add them later.
              </p>
            ) : (
              <ul className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2">
                {courses.map((c: any) => (
                  <li key={c.id} className="bg-muted/20 p-2 rounded">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.studyLevel?.name} • {c.discipline?.name}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-between pt-8 border-t mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(getPortalPath(collegeSlug, "/setup/academics"))
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => submitSetup()}
              disabled={!isReady || isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Submit & Go Live
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
