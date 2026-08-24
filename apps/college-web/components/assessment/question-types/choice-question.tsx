"use client";

import { OptionList } from "./option-list";
import type { QuestionRendererProps } from "./types";

export function ChoiceQuestion({
  content,
  response,
  onChange,
  multi,
}: QuestionRendererProps & { multi: boolean }) {
  return (
    <OptionList
      options={content.options ?? []}
      selected={response.selectedOptionIds ?? []}
      multi={multi}
      onChange={(selectedOptionIds) => onChange({ selectedOptionIds })}
    />
  );
}
