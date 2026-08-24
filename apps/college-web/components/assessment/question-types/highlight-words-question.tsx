"use client";

import { cn } from "@/lib/utils";
import type { QuestionRendererProps } from "./types";

export function HighlightWordsQuestion({
  content,
  response,
  onChange,
}: QuestionRendererProps) {
  const options = content.options ?? [];
  const selected = new Set(response.selectedOptionIds ?? []);

  function toggle(optionId: string) {
    const next = new Set(selected);
    if (next.has(optionId)) {
      next.delete(optionId);
    } else {
      next.add(optionId);
    }
    onChange({ selectedOptionIds: Array.from(next) });
  }

  return (
    <p className="rounded-2xl border border-border/40 bg-field p-4 text-sm leading-8 text-foreground">
      {options.map((option, i) => {
        const isSelected = selected.has(option.id);
        return (
          <span key={option.id}>
            <button
              type="button"
              onClick={() => toggle(option.id)}
              className={cn(
                "inline rounded-md px-1 py-0.5 transition-colors",
                isSelected
                  ? "bg-accentOrange text-accentOrange-foreground"
                  : "hover:bg-field-focus",
              )}
            >
              {option.text}
            </button>
            {i < options.length - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}
