"use client";

import Link from "next/link";
import { toast } from "sonner";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { useAuthStore } from "@/store";
import { SignInCta } from "@/components/campus-visit/sign-in-cta";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api";
import { ApplicationCourseCard } from "@/components/applications/application-course-card";
import { AddAnotherCoursePanel } from "@/components/applications/add-another-course-panel";
import { StickyPaymentBar } from "@/components/applications/sticky-payment-bar";
import {
  useApplicationStatus,
  useMyApplication,
  usePayApplicationFee,
  usePaymentSummary,
  useSubmitApplication,
} from "@/hooks/use-application";

interface ApplicationDetailProps {
  applicationId: string;
  subdomain: string;
}

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
};

function formatStatus(status: string): string {
  return (
    statusLabels[status] ??
    status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

export function ApplicationDetail({
  applicationId,
  subdomain,
}: ApplicationDetailProps) {
  const student = useAuthStore((s) => s.student);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const enabled = hasHydrated && student !== null;
  const {
    data: application,
    isLoading,
    error,
  } = useMyApplication(applicationId, enabled);
  const { data: statusList } = useApplicationStatus(
    application?.admissionCycleId ?? "",
    applicationId,
    enabled && !!application,
  );
  const status = statusList?.[0];
  const { data: paymentSummary } = usePaymentSummary(applicationId, enabled);
  const { mutate: submit, isPending: isSubmitting } =
    useSubmitApplication(applicationId);
  const { mutate: payFee, isPending: isPaying } =
    usePayApplicationFee(applicationId);

  if (!hasHydrated) return null;

  if (!student) {
    return (
      <SignInCta
        subdomain={subdomain}
        message="Sign in to view your application."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-24 animate-pulse rounded-lg border bg-muted" />
        <div className="h-24 animate-pulse rounded-lg border bg-muted" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <p className="text-sm text-destructive">
        {error ? getErrorMessage(error) : "Application not found."}
      </p>
    );
  }

  const isFeePaid =
    (paymentSummary?.feePaymentStatus ??
      status?.application.feePaymentStatus) === "paid";
  const isFormSubmitted = application.formStatus !== "draft";
  const assessmentRequired = status
    ? status.assessment.status !== "not_required"
    : true;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-field p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Application #{application.applicationNumber}
          </p>
          <span className="rounded-full bg-background px-3 py-1 text-xs font-medium">
            {formatStatus(application.formStatus)}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {isFeePaid ? (
            <Button asChild variant="outline">
              <Link
                href={`/college/${subdomain}/applications/${applicationId}/details`}
              >
                Fill in Application Details
              </Link>
            </Button>
          ) : (
            <Button
              disabled
              variant="outline"
              title="Pay the application fee to unlock this"
            >
              <Lock className="mr-1.5 h-3.5 w-3.5" />
              Fill in Application Details
            </Button>
          )}

          {assessmentRequired ? (
            isFormSubmitted ? (
              <Button asChild variant="outline">
                <Link
                  href={`/college/${subdomain}/applications/${applicationId}/assessment`}
                >
                  Assessment
                </Link>
              </Button>
            ) : (
              <Button
                disabled
                variant="outline"
                title="Submit your application to unlock this"
              >
                <Lock className="mr-1.5 h-3.5 w-3.5" />
                Assessment
              </Button>
            )
          ) : null}

          {application.formStatus === "draft" && !isFeePaid ? (
            <Button
              disabled
              variant="outline"
              title="Pay the application fee to unlock this"
            >
              <Lock className="mr-1.5 h-3.5 w-3.5" />
              Submit Application
            </Button>
          ) : null}

          {application.formStatus === "draft" && isFeePaid ? (
            <Button
              disabled={isSubmitting}
              className="bg-headerTeal-dark text-white hover:bg-headerTeal-dark/90"
              onClick={() =>
                submit(undefined, {
                  onSuccess: () => {
                    toast.success("Application submitted");
                  },
                })
              }
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Submit Application
            </Button>
          ) : null}
        </div>
        {status ? (
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Assessment</dt>
              <dd className="font-medium">
                {formatStatus(status.assessment.status)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Interview</dt>
              <dd className="font-medium">
                {formatStatus(status.interview.status)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Shortlisted</dt>
              <dd className="font-medium">
                {status.shortlist.isShortlisted ? "Yes" : "No"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Offer</dt>
              <dd className="font-medium">
                {formatStatus(status.amountDetails.status)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Enrollment</dt>
              <dd className="font-medium">
                {formatStatus(status.enrollmentStatus)}
              </dd>
            </div>
          </dl>
        ) : null}
      </div>

      {status && status.scholarships.length > 0 ? (
        <div className="rounded-2xl bg-field p-5">
          <h2 className="font-semibold">Scholarships</h2>
          <div className="mt-3 space-y-2">
            {status.scholarships.map((scholarship) => (
              <div
                key={scholarship.scholarshipApplicationId}
                className="flex items-center justify-between rounded-xl bg-background p-3 text-sm"
              >
                <span>{scholarship.scholarshipName}</span>
                <span className="text-muted-foreground">
                  {formatStatus(scholarship.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {paymentSummary ? (
        <div className="space-y-3">
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-sm text-amber-900 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Quota selection affects your application fee. Once payment is
              completed, the selected quota cannot be changed under any
              circumstances.
            </p>
          </div>

          {paymentSummary.courses.length === 0 ? (
            <p className="rounded-2xl bg-field p-4 text-sm text-muted-foreground">
              No courses added yet.
            </p>
          ) : (
            paymentSummary.courses.map((course) => (
              <ApplicationCourseCard
                key={course.applicationCourseId}
                applicationId={applicationId}
                course={course}
                isLocked={paymentSummary.isLocked}
                canWithdraw={
                  !paymentSummary.isLocked && paymentSummary.courses.length > 1
                }
              />
            ))
          )}

          {!paymentSummary.isLocked ? (
            <AddAnotherCoursePanel
              applicationId={applicationId}
              cycleId={application.admissionCycleId}
              existingCourseIds={paymentSummary.courses.map((c) => c.courseId)}
            />
          ) : null}

          <StickyPaymentBar
            totalApplicationFee={paymentSummary.totalApplicationFee}
            isPaid={paymentSummary.feePaymentStatus === "paid"}
            isPaying={isPaying}
            onPay={() =>
              payFee(undefined, {
                onSuccess: () => {
                  toast.success("Application fee paid");
                },
              })
            }
          />
        </div>
      ) : null}
    </div>
  );
}
