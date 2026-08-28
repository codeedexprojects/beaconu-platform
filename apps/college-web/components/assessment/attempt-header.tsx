"use client";

import { ChevronLeft, Clock } from "lucide-react";

interface AttemptStatusBarProps {
  questionOrder: number;
  totalQuestions: number;
  timeLeftSecs: number | null;
  sectionLabel?: string;
  onBack: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function AttemptStatusBar({
  questionOrder,
  totalQuestions,
  timeLeftSecs,
  sectionLabel,
  onBack,
}: AttemptStatusBarProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/60 text-foreground transition-colors hover:bg-field"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex flex-1 items-center gap-3 rounded-full bg-field px-4 py-2.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {sectionLabel ? `${sectionLabel} · Question` : "Question"}
          </p>
          <p className="text-sm font-bold text-foreground">
            {questionOrder}
            <span className="font-normal text-muted-foreground">
              /{totalQuestions}
            </span>
          </p>
        </div>

        {timeLeftSecs !== null ? (
          <>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Time Left
              </p>
              <p className="flex items-center gap-1 text-sm font-bold text-destructive">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(timeLeftSecs)}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
