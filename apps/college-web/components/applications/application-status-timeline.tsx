"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  Check,
  ChevronRight,
  FileText,
  Gift,
  Lock,
  PartyPopper,
  Star,
  Video,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api";
import {
  useApplicationStatus,
  useMyApplication,
} from "@/hooks/use-application";
import { TokenPaymentPanel } from "@/components/applications/token-payment-panel";
import { ScholarshipApplyDialog } from "@/components/applications/scholarship-apply-dialog";

interface ApplicationStatusTimelineProps {
  applicationId: string;
  subdomain: string;
  collegeId: string;
}

type StepState = "completed" | "current" | "pending" | "locked";

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TimelineStep({
  icon: Icon,
  title,
  state,
  subtitle,
  subtitleTone,
  children,
  isLast,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  state: StepState;
  subtitle?: string;
  subtitleTone?: "muted" | "success" | "warning" | "info";
  children?: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {!isLast ? (
        <div
          className={cn(
            "absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-px",
            state === "completed" || state === "current"
              ? "bg-foreground/30"
              : "bg-border",
          )}
        />
      ) : null}
      <div
        className={cn(
          "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          state === "completed" && "bg-foreground text-background",
          state === "current" &&
            "bg-accentOrange-soft text-accentOrange ring-2 ring-accentOrange",
          state === "pending" &&
            "border border-border bg-background text-muted-foreground",
          state === "locked" &&
            "border border-border/60 bg-muted text-muted-foreground/60",
        )}
      >
        {state === "completed" ? (
          <Check className="h-4 w-4" />
        ) : state === "locked" ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 pt-1.5">
        <p
          className={cn(
            "text-sm font-semibold",
            state === "locked" ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {title}
        </p>
        {subtitle ? (
          <p
            className={cn(
              "mt-0.5 text-xs font-medium",
              subtitleTone === "success" && "text-emerald-600",
              subtitleTone === "warning" && "text-accentOrange",
              subtitleTone === "info" && "text-muted-foreground",
              (!subtitleTone || subtitleTone === "muted") &&
                "text-muted-foreground",
            )}
          >
            {subtitle}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function ApplicationStatusTimeline({
  applicationId,
  subdomain,
  collegeId,
}: ApplicationStatusTimelineProps) {
  const [scholarshipDialogOpen, setScholarshipDialogOpen] = useState(false);
  const {
    data: application,
    isLoading: isLoadingApplication,
    error: applicationError,
  } = useMyApplication(applicationId, true);
  const {
    data: statusList,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useApplicationStatus(
    application?.admissionCycleId ?? "",
    applicationId,
    !!application,
  );

  if (isLoadingApplication || isLoadingStatus) {
    return (
      <div className="space-y-3">
        <div className="h-24 animate-pulse rounded-2xl border bg-muted" />
        <div className="h-24 animate-pulse rounded-2xl border bg-muted" />
        <div className="h-24 animate-pulse rounded-2xl border bg-muted" />
      </div>
    );
  }

  if (applicationError || statusError) {
    return (
      <p className="text-sm text-destructive">
        {getErrorMessage(applicationError ?? statusError)}
      </p>
    );
  }

  const status = statusList?.[0];

  if (!application || !status) {
    return (
      <p className="text-sm text-destructive">
        {!application ? "Application not found." : "Status not available yet."}
      </p>
    );
  }

  const { assessment, interview, shortlist, scholarships, amountDetails } =
    status;
  const isSubmitted = application.formStatus !== "draft";
  const isReviewDone =
    shortlist.isShortlisted || status.enrollmentStatus !== "not_enrolled";

  const assessmentDone =
    assessment.status === "completed" ||
    assessment.status === "auto_submitted" ||
    assessment.status === "evaluated" ||
    assessment.status === "result_published" ||
    assessment.status === "under_evaluation";
  const assessmentRequired = assessment.status !== "not_required";

  const interviewDone = interview.status === "completed";
  const interviewBooked = interview.status === "booked";

  const scholarshipDecided = scholarships.some((s) => s.status !== "pending");
  const hasScholarshipApplication = scholarships.length > 0;

  const tokenPaid = amountDetails.tokenPaymentStatus === "paid";
  const offerIssued = amountDetails.status === "issued";

  const enrolled = status.enrollmentStatus === "active";

  return (
    <div className="rounded-2xl border border-border/60 p-5">
      <p className="text-xs text-muted-foreground">
        {application.applicationNumber} · {status.application.collegeName}
      </p>

      <div className="mt-5">
        <TimelineStep
          icon={FileText}
          title="Application Submitted"
          state={isSubmitted ? "completed" : "current"}
          subtitle={
            application.submittedAt
              ? (formatDate(application.submittedAt) ?? undefined)
              : undefined
          }
        >
          <Link
            href={`/college/${subdomain}/applications/${applicationId}/details`}
            className="mt-3 flex items-center justify-between rounded-xl border border-border/60 p-3 text-sm hover:bg-field"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">View Application</p>
                <p className="text-xs text-muted-foreground">Live Status</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </TimelineStep>

        <TimelineStep
          icon={FileText}
          title="Application Under Review"
          state={
            !isSubmitted ? "locked" : isReviewDone ? "completed" : "current"
          }
          subtitle={
            isReviewDone ? "Completed" : isSubmitted ? "In progress" : undefined
          }
          subtitleTone={isReviewDone ? "success" : "info"}
        />

        {assessmentRequired ? (
          <TimelineStep
            icon={Award}
            title="Take Assessment"
            state={
              !isSubmitted ? "locked" : assessmentDone ? "completed" : "current"
            }
            subtitle={
              assessmentDone
                ? "Completed"
                : assessment.status === "in_progress"
                  ? "In progress"
                  : "Action Required"
            }
            subtitleTone={assessmentDone ? "success" : "warning"}
          >
            {!assessmentDone && isSubmitted ? (
              <Button
                asChild
                className="mt-3 h-11 w-full rounded-full border-0 bg-gradient-to-r from-[hsl(var(--accent-orange-gradient-from))] to-[hsl(var(--accent-orange-gradient-to))] text-sm font-semibold text-accentOrange-foreground shadow-md hover:opacity-95"
              >
                <Link
                  href={`/college/${subdomain}/applications/${applicationId}/assessment`}
                >
                  Start Assessment
                </Link>
              </Button>
            ) : null}
          </TimelineStep>
        ) : null}

        <TimelineStep
          icon={Video}
          title="Attend Interview"
          state={
            !assessmentDone ? "locked" : interviewDone ? "completed" : "current"
          }
          subtitle={
            interviewDone
              ? "Completed"
              : interviewBooked
                ? (formatDate(interview.scheduledAt) ?? "Scheduled")
                : assessmentDone
                  ? "Action Required"
                  : "Pending Assessment Completion"
          }
          subtitleTone={
            interviewDone
              ? "success"
              : interviewBooked
                ? "info"
                : assessmentDone
                  ? "warning"
                  : "info"
          }
        >
          {!interviewDone && assessmentDone ? (
            <Button
              asChild
              variant="outline"
              className="mt-3 h-11 w-full rounded-full"
            >
              <Link
                href={`/college/${subdomain}/applications/${applicationId}/interview`}
              >
                {interviewBooked
                  ? "View Interview Details"
                  : "Book Interview Slot"}
                <Video className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : null}
        </TimelineStep>

        <TimelineStep
          icon={Star}
          title="Application Shortlisted"
          state={
            !interviewDone
              ? "locked"
              : shortlist.isShortlisted
                ? "completed"
                : "current"
          }
          subtitle={
            shortlist.isShortlisted
              ? "Congrats! Proceed to next step."
              : interviewDone
                ? "Under evaluation"
                : undefined
          }
          subtitleTone="muted"
        />

        {hasScholarshipApplication || shortlist.isShortlisted ? (
          <TimelineStep
            icon={Gift}
            title="Submit Scholarship Application"
            state={
              !shortlist.isShortlisted
                ? "locked"
                : scholarshipDecided
                  ? "completed"
                  : "current"
            }
            subtitle={scholarshipDecided ? "Completed" : "Optional"}
            subtitleTone={scholarshipDecided ? "success" : "warning"}
          >
            {shortlist.isShortlisted && !hasScholarshipApplication ? (
              <Button
                type="button"
                variant="outline"
                className="mt-3 h-11 w-full rounded-full"
                onClick={() => setScholarshipDialogOpen(true)}
              >
                Apply for Scholarship
                <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            ) : null}
          </TimelineStep>
        ) : null}

        <TimelineStep
          icon={Wallet}
          title="Pay Token Amount"
          state={
            !shortlist.isShortlisted
              ? "locked"
              : tokenPaid
                ? "completed"
                : "current"
          }
          subtitle={tokenPaid ? "Paid" : "Action Required"}
          subtitleTone={tokenPaid ? "success" : "warning"}
        >
          {!tokenPaid &&
          shortlist.isShortlisted &&
          amountDetails.tokenAmount ? (
            <>
              <TokenPaymentPanel
                applicationId={applicationId}
                amountDetails={amountDetails}
              />
              {amountDetails.validUntil ? (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Deadline: {formatDate(amountDetails.validUntil)}
                </p>
              ) : null}
            </>
          ) : null}
        </TimelineStep>

        <TimelineStep
          icon={FileText}
          title="Issue Offer Letter"
          state={!tokenPaid ? "locked" : offerIssued ? "completed" : "current"}
          subtitle={
            offerIssued ? "Issued" : !tokenPaid ? "Pending Payment" : undefined
          }
        >
          {offerIssued && amountDetails.documentUrl ? (
            <a
              href={amountDetails.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border/60 text-sm font-medium hover:bg-field"
            >
              <FileText className="h-4 w-4" />
              View Offer Letter
            </a>
          ) : null}
        </TimelineStep>

        <TimelineStep
          icon={PartyPopper}
          title="Welcome to the Campus!"
          state={enrolled ? "completed" : "locked"}
          subtitle="Ready to start your journey?"
          isLast
        >
          {enrolled ? (
            <Button
              asChild
              className="mt-3 h-11 w-full rounded-full border-0 bg-gradient-to-r from-fuchsia-500 to-accentOrange text-sm font-semibold text-white shadow-md hover:opacity-95"
            >
              <Link href={`/college/${subdomain}`}>
                Get Set Go
                <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : null}
        </TimelineStep>
      </div>

      <ScholarshipApplyDialog
        open={scholarshipDialogOpen}
        onClose={() => setScholarshipDialogOpen(false)}
        applicationId={applicationId}
        collegeId={collegeId}
      />
    </div>
  );
}
