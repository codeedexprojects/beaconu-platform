"use client";

import { cn } from "@/lib/utils";
import type { QuestionRendererProps } from "./types";

// The backend has no structured per-turn content shape for dialogueCompletion
// today (see question-type-seeds.ts) — content.text is a single string with
// "A: ...\nB: ___" style turns embedded, and the student answers with one
// text_response covering the blank turn. This parses that string into
// alternating bubbles for display only; the actual response is still a
// single text field, matched to the last (blank) turn.
function parseTurns(text: string): { speaker: string; line: string }[] {
  const turns: { speaker: string; line: string }[] = [];
  const regex = /([A-Z]):\s*/g;
  const matches = Array.from(text.matchAll(regex));
  for (let i = 0; i < matches.length; i++) {
    const speaker = matches[i][1];
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    turns.push({ speaker, line: text.slice(start, end).trim() });
  }
  return turns;
}

export function DialogueQuestion({
  content,
  response,
  onChange,
}: QuestionRendererProps) {
  const turns = parseTurns(content.text ?? "");

  return (
    <div className="space-y-4">
      {turns.length > 0 ? (
        <div className="space-y-2 rounded-2xl border border-border/40 bg-field p-4">
          {turns.map((turn, i) => {
            const isLeft = turn.speaker === turns[0].speaker;
            const isBlank = turn.line === "___" || turn.line === "";
            return (
              <div
                key={i}
                className={cn(
                  "flex items-end gap-2",
                  !isLeft && "flex-row-reverse",
                )}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accentOrange-soft text-[11px] font-semibold text-accentOrange">
                  {turn.speaker}
                </span>
                {isBlank ? (
                  <input
                    value={response.text ?? ""}
                    onChange={(e) => onChange({ text: e.target.value })}
                    placeholder="Type your response..."
                    className="max-w-[75%] rounded-2xl border-0 bg-background px-4 py-2 text-sm text-foreground outline-none ring-1 ring-border/60 focus-visible:ring-2 focus-visible:ring-accentOrange/40"
                  />
                ) : (
                  <p className="max-w-[75%] rounded-2xl bg-background px-4 py-2 text-sm text-foreground">
                    {turn.line}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <textarea
          rows={4}
          value={response.text ?? ""}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Type your response..."
          className="w-full rounded-2xl border-0 bg-field px-5 py-3 text-sm text-foreground outline-none transition-colors focus:bg-field-focus focus-visible:ring-2 focus-visible:ring-accentOrange/40"
        />
      )}
    </div>
  );
}
