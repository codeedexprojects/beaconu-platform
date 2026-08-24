"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Loader2,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconSectionHeader } from "@/components/ui/icon-section-header";
import { getErrorMessage } from "@/lib/api";
import {
  useAssessmentStart,
  useMyAttempt,
  useStartAttempt,
} from "@/hooks/use-assessment";
import { TrialRunner } from "@/components/assessment/trial-runner";
import { TrialResult } from "@/components/assessment/trial-result";
import { AttemptRunner } from "@/components/assessment/attempt-runner";
import type { TrialResult as TrialResultDto } from "@beaconu/types";

interface AssessmentRoomProps {
  applicationId: string;
}

type RoomView = "overview" | "trial" | "trial-result" | "attempt";

function formatDateTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AssessmentRoom({ applicationId }: AssessmentRoomProps) {
  const {
    data: start,
    isLoading,
    error,
  } = useAssessmentStart(applicationId, true);
  const [view, setView] = useState<RoomView>("overview");
  const [trialResult, setTrialResult] = useState<TrialResultDto | null>(null);

  const { mutate: beginAttempt, isPending: isStarting } =
    useStartAttempt(applicationId);
  const { data: liveAttempt } = useMyAttempt(
    start?.myAttempt?.id,
    !!start?.myAttempt,
  );

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl border bg-muted" />;
  }

  if (error) {
    return (
      <p className="rounded-2xl border border-border/60 p-5 text-sm text-destructive">
        {getErrorMessage(error)}
      </p>
    );
  }

  if (!start) return null;

  if (view === "trial") {
    return (
      <TrialRunner
        templateId={start.template.id}
        onComplete={(result) => {
          setTrialResult(result);
          setView("trial-result");
        }}
        onExit={() => setView("overview")}
      />
    );
  }

  if (view === "trial-result" && trialResult) {
    return (
      <TrialResult
        result={trialResult}
        onRetake={() => setView("trial")}
        onExit={() => setView("overview")}
      />
    );
  }

  if (view === "attempt" && liveAttempt) {
    return (
      <AttemptRunner
        attempt={liveAttempt}
        onComplete={() => setView("overview")}
      />
    );
  }

  const attemptStatus = start.myAttempt?.status;
  const hasStartedAttempt = !!start.myAttempt;
  const isInProgress = attemptStatus === "in_progress";
  const isTerminal =
    hasStartedAttempt &&
    attemptStatus !== "in_progress" &&
    attemptStatus !== "not_started";

  function handleStartAssessment() {
    beginAttempt(undefined, {
      onSuccess: () => {
        toast.success("Assessment started");
        setView("attempt");
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-2xl border border-border/60 p-5">
        <IconSectionHeader
          icon={ClipboardList}
          title={start.template.name}
          subLabel="Assessment"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/40 p-3 text-center">
            <p className="text-lg font-semibold text-foreground">
              {start.template.totalQuestions}
            </p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </div>
          <div className="rounded-xl border border-border/40 p-3 text-center">
            <p className="text-lg font-semibold text-foreground">
              {start.template.totalMarks}
            </p>
            <p className="text-xs text-muted-foreground">Total Marks</p>
          </div>
          <div className="rounded-xl border border-border/40 p-3 text-center">
            <p className="text-lg font-semibold text-foreground">
              {start.template.totalDurationMins}
            </p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </div>
        </div>

        {start.template.sections.length > 0 ? (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-accentOrange">
              Sections
            </p>
            <div className="space-y-2">
              {start.template.sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between rounded-xl border border-border/40 px-4 py-2.5 text-sm"
                >
                  <span className="text-foreground">{section.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {section.questionCount} questions · {section.timeLimitMins}{" "}
                    min
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-3 rounded-2xl border border-border/60 p-5">
        <IconSectionHeader
          icon={ClipboardCheck}
          title="Your Assessment"
          subLabel="Graded · Counts Toward Your Application"
        />

        {isTerminal ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-field p-3.5 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              Your assessment has been submitted
              {liveAttempt?.totalScore != null && liveAttempt?.maxScore != null
                ? ` — ${liveAttempt.totalScore} / ${liveAttempt.maxScore}`
                : ""}
              . You&apos;ll be notified once it&apos;s evaluated.
            </span>
          </div>
        ) : isInProgress ? (
          <>
            <p className="text-sm text-muted-foreground">
              You have an assessment in progress. Continue where you left off —
              your answers so far are already saved.
            </p>
            <Button
              type="button"
              onClick={() => setView("attempt")}
              className="h-12 w-full rounded-full border-0 bg-gradient-to-r from-[hsl(var(--accent-orange-gradient-from))] to-[hsl(var(--accent-orange-gradient-to))] text-base font-semibold text-accentOrange-foreground shadow-md hover:opacity-95"
            >
              Continue Assessment
            </Button>
          </>
        ) : !start.isWithinWindow ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-field p-3.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              {start.hasWindowPassed
                ? "The scheduled window for this assessment has passed."
                : start.slot
                  ? `Your assessment opens on ${formatDateTime(start.slot.windowStart)}.`
                  : "No assessment slot has been scheduled for you yet."}
            </span>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              This is your real, graded assessment attempt — it can only be
              taken once, and progress is autosaved as you go. You have until{" "}
              {start.slot
                ? formatDateTime(start.slot.windowEnd)
                : "the end of your window"}
              .
            </p>
            <Button
              type="button"
              onClick={handleStartAssessment}
              disabled={isStarting}
              className="h-12 w-full rounded-full border-0 bg-foreground text-base font-semibold text-background shadow-md hover:opacity-90"
            >
              {isStarting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Start Assessment
            </Button>
          </>
        )}
      </div>

      {start.hasActiveTrialPaper ? (
        <div className="space-y-3 rounded-2xl border border-border/60 p-5">
          <IconSectionHeader
            icon={PlayCircle}
            title="Try a Practice Test"
            subLabel="Trial"
          />
          <p className="text-sm text-muted-foreground">
            Get familiar with the question types and format before your real
            assessment. Trial runs are unlimited, scored instantly, and are
            never saved or counted toward your application.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setView("trial")}
            className="h-12 w-full rounded-full"
          >
            Start Practice Trial
          </Button>
        </div>
      ) : null}
    </div>
  );
}
