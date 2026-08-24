"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QuestionRendererProps } from "./types";

export function BlankFillQuestion({
  content,
  response,
  onChange,
}: QuestionRendererProps) {
  const blanks = content.blanks ?? [];
  const options = content.options ?? [];
  const blankAnswers = response.blankAnswers ?? [];

  function setBlank(blankId: string, optionId: string) {
    const next = blankAnswers.filter((b) => b.blankId !== blankId);
    next.push({ blankId, optionId });
    onChange({ blankAnswers: next });
  }

  return (
    <div className="space-y-2">
      {blanks.map((blank, index) => {
        const current = blankAnswers.find((b) => b.blankId === blank.id);
        return (
          <div
            key={blank.id}
            className="grid grid-cols-2 items-center gap-3 rounded-2xl border border-border/40 p-3"
          >
            <div className="flex items-center gap-2 rounded-xl bg-field px-3 py-2.5 text-sm font-medium text-foreground">
              {blank.imageUrl ? (
                <img
                  src={blank.imageUrl}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded object-cover"
                />
              ) : null}
              {blank.label ?? `Item ${index + 1}`}
            </div>
            <Select
              value={current?.optionId}
              onValueChange={(v) => setBlank(blank.id, v)}
            >
              <SelectTrigger className="rounded-xl border-dashed">
                <SelectValue placeholder="Select an answer" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}
