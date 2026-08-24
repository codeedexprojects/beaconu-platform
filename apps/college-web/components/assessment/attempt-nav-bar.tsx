"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flag,
  Loader2,
  SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AttemptNavBarProps {
  onPrevious: () => void;
  previousDisabled: boolean;
  onNext: () => void;
  nextDisabled?: boolean;
  onSkip?: () => void;
  isFlagged?: boolean;
  onToggleFlag?: () => void;
  isLast: boolean;
  isSubmitting: boolean;
}

export function AttemptNavBar({
  onPrevious,
  previousDisabled,
  onNext,
  nextDisabled,
  onSkip,
  isFlagged,
  onToggleFlag,
  isLast,
  isSubmitting,
}: AttemptNavBarProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onPrevious}
        disabled={previousDisabled}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/60 text-foreground transition-colors hover:bg-field disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1">
        {onToggleFlag ? (
          <button
            type="button"
            onClick={onToggleFlag}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              isFlagged
                ? "bg-accentOrange-soft text-accentOrange"
                : "text-muted-foreground hover:bg-field",
            )}
          >
            <Flag className="h-3.5 w-3.5" />
            {isFlagged ? "Flagged" : "Flag"}
          </button>
        ) : null}
        {onSkip && !isLast ? (
          <button
            type="button"
            onClick={onSkip}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-field"
          >
            <SkipForward className="h-3.5 w-3.5" />
            Skip
          </button>
        ) : null}
      </div>

      {isLast ? (
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting || nextDisabled}
          className="flex h-11 items-center gap-2 rounded-full border-0 bg-gradient-to-r from-[hsl(var(--accent-orange-gradient-from))] to-[hsl(var(--accent-orange-gradient-to))] px-6 text-sm font-semibold text-accentOrange-foreground shadow-md transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Submit
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-accentOrange bg-accentOrange-soft text-accentOrange transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
