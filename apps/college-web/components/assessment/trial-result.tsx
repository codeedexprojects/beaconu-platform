"use client";

import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconSectionHeader } from "@/components/ui/icon-section-header";
import type { TrialResult as TrialResultDto } from "@beaconu/types";

interface TrialResultProps {
  result: TrialResultDto;
  onRetake: () => void;
  onExit: () => void;
}

export function TrialResult({ result, onRetake, onExit }: TrialResultProps) {
  const notAutoScoredCount = result.perQuestion.filter(
    (q) => !q.scorable,
  ).length;

  return (
    <div className="space-y-5 rounded-2xl border border-border/60 p-5">
      <IconSectionHeader
        icon={Award}
        title="Trial Results"
        subLabel="Practice Run · Not Recorded"
      />

      <div className="rounded-2xl border border-border/40 bg-field p-5 text-center">
        <p className="text-4xl font-bold text-foreground">
          {result.totalScore}
          <span className="text-lg font-medium text-muted-foreground">
            {" "}
            / {result.maxScore}
          </span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Total Score</p>
      </div>

      {Object.keys(result.sectionScores).length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-headerTeal">
            Section Breakdown
          </p>
          <div className="space-y-2">
            {Object.entries(result.sectionScores).map(([section, score]) => (
              <div
                key={section}
                className="flex items-center justify-between rounded-xl border border-border/40 px-4 py-2.5 text-sm"
              >
                <span className="text-foreground">{section}</span>
                <span className="font-medium text-muted-foreground">
                  {score.score} / {score.max}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {notAutoScoredCount > 0 ? (
        <p className="rounded-lg border border-border/40 bg-field p-3 text-xs text-muted-foreground">
          {notAutoScoredCount} question{notAutoScoredCount === 1 ? "" : "s"} in
          this trial (e.g. written or spoken responses) aren&apos;t auto-scored,
          so they&apos;re not included in the total above.
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        This is a practice run — nothing here is saved or counted toward your
        real assessment attempt. Retake it as many times as you like.
      </p>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onExit}
          className="flex-1 rounded-full"
        >
          Back to Assessment Room
        </Button>
        <Button
          type="button"
          onClick={onRetake}
          className="flex-1 rounded-full border-0 bg-headerTeal-dark text-white shadow-md hover:opacity-95"
        >
          Retake Trial
        </Button>
      </div>
    </div>
  );
}
