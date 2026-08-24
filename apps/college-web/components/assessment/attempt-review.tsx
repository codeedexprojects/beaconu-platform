"use client";

import { useQueries } from "@tanstack/react-query";
import { Check, CheckCircle2, Flag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getAttemptOverview } from "@/lib/services/assessment.service";
import type { AttemptSectionSummary } from "@beaconu/types";

interface AttemptReviewProps {
  attemptId: string;
  sections: AttemptSectionSummary[];
  onJumpToQuestion: (sectionIndex: number, questionOrder: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function AttemptReview({
  attemptId,
  sections,
  onJumpToQuestion,
  onSubmit,
  isSubmitting,
}: AttemptReviewProps) {
  const overviews = useQueries({
    queries: sections.map((section) => ({
      queryKey: QUERY_KEYS.attemptOverview(attemptId, section.sectionId),
      queryFn: () => getAttemptOverview(attemptId, section.sectionId),
    })),
  });

  const isLoading = overviews.some((q) => q.isLoading);

  let attemptedCount = 0;
  let flaggedCount = 0;
  let skippedCount = 0;

  if (!isLoading) {
    for (const q of overviews) {
      for (const question of q.data?.questions ?? []) {
        if (question.isAnswered) attemptedCount++;
        else if (question.isFlagged) flaggedCount++;
        else skippedCount++;
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">
          Review Your Answers
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Check your progress before submitting. You can jump back to any
          question to change your answer.
        </p>

        {isLoading ? (
          <div className="mt-4 h-16 animate-pulse rounded-2xl bg-muted" />
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-field p-3 text-center">
              <p className="text-lg font-bold text-foreground">
                {attemptedCount}
              </p>
              <p className="text-xs text-muted-foreground">Attempted</p>
            </div>
            <div className="rounded-xl bg-field p-3 text-center">
              <p className="text-lg font-bold text-accentOrange">
                {flaggedCount}
              </p>
              <p className="text-xs text-muted-foreground">Flagged</p>
            </div>
            <div className="rounded-xl bg-field p-3 text-center">
              <p className="text-lg font-bold text-muted-foreground">
                {skippedCount}
              </p>
              <p className="text-xs text-muted-foreground">Skipped</p>
            </div>
          </div>
        )}
      </div>

      {isLoading
        ? null
        : sections.map((section, sectionIndex) => {
            const overview = overviews[sectionIndex]?.data;
            if (!overview) return null;
            return (
              <div
                key={section.id}
                className="rounded-2xl border border-border/60 bg-card p-5"
              >
                <p className="text-sm font-semibold text-foreground">
                  {section.name}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {overview.questions.map((question) => (
                    <button
                      key={question.questionId}
                      type="button"
                      onClick={() =>
                        onJumpToQuestion(sectionIndex, question.questionOrder)
                      }
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                        question.isAnswered
                          ? "border-transparent bg-foreground text-background"
                          : question.isFlagged
                            ? "border-accentOrange bg-accentOrange-soft text-accentOrange"
                            : "border-dashed border-border text-muted-foreground hover:bg-field",
                      )}
                    >
                      {question.isAnswered ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : question.isFlagged ? (
                        <Flag className="h-3.5 w-3.5" />
                      ) : (
                        question.questionOrder
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

      <Button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || isLoading}
        className="h-14 w-full rounded-full border-0 bg-gradient-to-r from-[hsl(var(--accent-orange-gradient-from))] to-[hsl(var(--accent-orange-gradient-to))] text-base font-semibold text-accentOrange-foreground shadow-md hover:opacity-95"
      >
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-2 h-4 w-4" />
        )}
        Submit Assessment
      </Button>
    </div>
  );
}
