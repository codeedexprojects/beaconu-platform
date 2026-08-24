"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  BlankAnswer,
  QuestionBlank,
  QuestionOption,
} from "@beaconu/types";

const BLANK_TOKEN = "[[blank]]";

interface InlineBlankTextProps {
  text: string;
  blanks: QuestionBlank[];
  options: QuestionOption[];
  mode: "dropdown" | "drag";
  blankAnswers: BlankAnswer[];
  onChange: (blankAnswers: BlankAnswer[]) => void;
}

export function InlineBlankText({
  text,
  blanks,
  options,
  mode,
  blankAnswers,
  onChange,
}: InlineBlankTextProps) {
  const [activeBlankId, setActiveBlankId] = useState<string | null>(null);
  const segments = text.split(BLANK_TOKEN);

  function setBlank(blankId: string, optionId: string) {
    const next = blankAnswers.filter((b) => b.blankId !== blankId);
    next.push({ blankId, optionId });
    onChange(next);
  }

  function clearBlank(blankId: string) {
    onChange(blankAnswers.filter((b) => b.blankId !== blankId));
  }

  function pickWord(optionId: string) {
    if (activeBlankId) {
      setBlank(activeBlankId, optionId);
      setActiveBlankId(null);
      return;
    }
    const nextEmptyBlank = blanks.find(
      (b) => !blankAnswers.some((ba) => ba.blankId === b.id),
    );
    if (nextEmptyBlank) setBlank(nextEmptyBlank.id, optionId);
  }

  const usedOptionIds = new Set(blankAnswers.map((b) => b.optionId));

  return (
    <div className="space-y-4">
      <p className="whitespace-pre-wrap text-sm leading-8 text-foreground">
        {segments.map((segment, i) => {
          const blank = blanks[i];
          const current = blank
            ? blankAnswers.find((b) => b.blankId === blank.id)
            : undefined;
          const currentOption = current
            ? options.find((o) => o.id === current.optionId)
            : undefined;

          return (
            <span key={i}>
              {segment}
              {blank ? (
                mode === "dropdown" ? (
                  <Select
                    value={current?.optionId}
                    onValueChange={(v) => setBlank(blank.id, v)}
                  >
                    <SelectTrigger className="mx-1 inline-flex h-7 w-auto min-w-28 rounded-full px-3 py-0 text-xs">
                      <SelectValue placeholder="Select answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentOption) {
                        clearBlank(blank.id);
                      } else {
                        setActiveBlankId(blank.id);
                      }
                    }}
                    className={cn(
                      "mx-1 inline-flex min-w-20 items-center justify-center rounded-full border px-3 py-0.5 text-xs font-medium transition-colors",
                      currentOption
                        ? "border-accentOrange bg-accentOrange-soft text-accentOrange"
                        : activeBlankId === blank.id
                          ? "border-accentOrange border-dashed text-accentOrange"
                          : "border-dashed border-border text-muted-foreground",
                    )}
                  >
                    {currentOption?.text ?? "___"}
                  </button>
                )
              ) : null}
            </span>
          );
        })}
      </p>

      {mode === "drag" ? (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {activeBlankId
              ? "Pick a word for the selected blank"
              : "Tap a blank, then a word"}
          </p>
          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              const isUsed = usedOptionIds.has(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={isUsed}
                  onClick={() => pickWord(option.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    isUsed
                      ? "cursor-not-allowed border-border/40 text-muted-foreground/50"
                      : "border-border/60 bg-field hover:bg-field-focus",
                  )}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
