"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionOption } from "@beaconu/types";

interface OptionListProps {
  options: QuestionOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multi: boolean;
}

export function OptionList({
  options,
  selected,
  onChange,
  multi,
}: OptionListProps) {
  function toggle(optionId: string) {
    if (multi) {
      onChange(
        selected.includes(optionId)
          ? selected.filter((id) => id !== optionId)
          : [...selected, optionId],
      );
    } else {
      onChange([optionId]);
    }
  }

  return (
    <div className="space-y-2">
      {options.map((option, index) => {
        const isSelected = selected.includes(option.id);
        const letter = String.fromCharCode(65 + index);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => toggle(option.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
              isSelected
                ? "border-headerTeal-dark bg-headerTeal/10 text-foreground"
                : "border-border/60 bg-field text-foreground hover:bg-field-focus",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center border-2 text-xs font-semibold text-white",
                multi ? "rounded-md" : "rounded-full",
                isSelected
                  ? "border-headerTeal-dark bg-headerTeal-dark"
                  : "border-border bg-background text-muted-foreground",
              )}
            >
              {isSelected ? <Check className="h-3.5 w-3.5" /> : letter}
            </span>
            <span>{option.text}</span>
          </button>
        );
      })}
    </div>
  );
}
