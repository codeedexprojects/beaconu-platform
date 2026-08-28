"use client";

import type { QuestionRendererProps } from "./types";

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function TextQuestion({ response, onChange }: QuestionRendererProps) {
  const text = response.text ?? "";

  return (
    <div className="overflow-hidden rounded-2xl bg-field">
      <textarea
        rows={6}
        value={text}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder="Type your answer..."
        className="w-full resize-none border-0 bg-transparent px-5 pt-3 text-sm text-foreground outline-none transition-colors focus:bg-field-focus focus-visible:ring-2 focus-visible:ring-headerTeal/40"
      />
      <div className="flex items-center justify-end border-t border-border/40 px-4 py-2">
        <span className="text-xs text-muted-foreground">
          {countWords(text)} words
        </span>
      </div>
    </div>
  );
}
