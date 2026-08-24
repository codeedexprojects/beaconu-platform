"use client";

import { ChoiceQuestion } from "./choice-question";
import { BlankFillQuestion } from "./blank-fill-question";
import { TextQuestion } from "./text-question";
import { AudioQuestion } from "./audio-question";
import { HighlightWordsQuestion } from "./highlight-words-question";
import { InlineBlankText } from "./inline-blank-text";
import { DialogueQuestion } from "./dialogue-question";
import type { QuestionRendererProps } from "./types";

const SINGLE_CHOICE_FORMATS = new Set(["single_choice", "voice_mcq"]);
const MULTI_CHOICE_FORMATS = new Set(["multi_choice", "voice_incorrect_words"]);
const WORD_HIGHLIGHT_FORMATS = new Set(["word_highlight"]);
const BLANK_FILL_FORMATS = new Set([
  "fill_blank_drag_drop",
  "fill_blank_dropdown",
  "matching",
  "voice_dropdown",
  "voice_fill_blank",
]);
const INLINE_BLANK_FORMATS = new Set([
  "fill_blank_drag_drop",
  "fill_blank_dropdown",
]);
const AUDIO_FORMATS = new Set(["audio_response"]);
const TEXT_FORMATS = new Set(["text_response"]);

const BLANK_TOKEN = "[[blank]]";

// dialogueCompletion has no dedicated responseFormat of its own — it's seeded
// as text_response like every other textInput type (see
// question-type-seeds.ts). There's no category/slug passed through on
// AttemptQuestionItem (confirmed: packages/types/src/assessment.ts only
// exposes responseFormat, not questionTypeSlug/category) — so a dialogue is
// distinguished purely by its content shape: multiple "A: ...\nB: ..."-style
// turn markers embedded in content.text, which no other text_response type
// produces.
function looksLikeDialogue(text: string | undefined): boolean {
  if (!text) return false;
  const matches = text.match(/(^|\n)[A-Z]:\s/g);
  return (matches?.length ?? 0) >= 2;
}

interface QuestionRendererFullProps extends QuestionRendererProps {
  // The real attempt flow's question DTO includes the question type's
  // actual responseFormat, so the correct renderer can be picked exactly.
  // The trial flow's DTO does not expose it (confirmed — TrialPaperItem
  // only has questionTypeId, and there's no student-facing endpoint to
  // resolve a type id back to its responseFormat) — when omitted, fall
  // back to inferring the renderer from which fields are present on
  // `content` (see the inference notes below).
  responseFormat?: string;
}

export function QuestionRenderer({
  content,
  response,
  onChange,
  responseFormat,
}: QuestionRendererFullProps) {
  if (responseFormat) {
    if (TEXT_FORMATS.has(responseFormat) && looksLikeDialogue(content.text)) {
      return (
        <DialogueQuestion
          content={content}
          response={response}
          onChange={onChange}
        />
      );
    }
    if (SINGLE_CHOICE_FORMATS.has(responseFormat)) {
      return (
        <ChoiceQuestion
          content={content}
          response={response}
          onChange={onChange}
          multi={false}
        />
      );
    }
    if (WORD_HIGHLIGHT_FORMATS.has(responseFormat)) {
      return (
        <HighlightWordsQuestion
          content={content}
          response={response}
          onChange={onChange}
        />
      );
    }
    if (MULTI_CHOICE_FORMATS.has(responseFormat)) {
      return (
        <ChoiceQuestion
          content={content}
          response={response}
          onChange={onChange}
          multi
        />
      );
    }
    if (
      INLINE_BLANK_FORMATS.has(responseFormat) &&
      content.text?.includes(BLANK_TOKEN) &&
      content.blanks &&
      content.blanks.length > 0
    ) {
      return (
        <InlineBlankText
          text={content.text}
          blanks={content.blanks}
          options={content.options ?? []}
          mode={responseFormat === "fill_blank_dropdown" ? "dropdown" : "drag"}
          blankAnswers={response.blankAnswers ?? []}
          onChange={(blankAnswers) => onChange({ blankAnswers })}
        />
      );
    }
    if (BLANK_FILL_FORMATS.has(responseFormat)) {
      return (
        <BlankFillQuestion
          content={content}
          response={response}
          onChange={onChange}
        />
      );
    }
    if (AUDIO_FORMATS.has(responseFormat)) {
      return (
        <AudioQuestion
          content={content}
          response={response}
          onChange={onChange}
        />
      );
    }
    if (TEXT_FORMATS.has(responseFormat)) {
      return (
        <TextQuestion
          content={content}
          response={response}
          onChange={onChange}
        />
      );
    }
    // Unrecognized format string — fall through to content-shape inference
    // below rather than rendering nothing.
  }

  // Inference fallback (used by trial, and any unrecognized format above):
  //   - blanks present + [[blank]] tokens -> inline blank text (reading style)
  //   - blanks present (no tokens)        -> fill-blank / matching (dropdown per blank)
  //   - options present (no blanks)       -> choice question, rendered with
  //     multi-select-capable checkboxes since content alone can't distinguish
  //     single_choice from multi_choice — a single_choice question is still
  //     answered correctly by checking exactly one box
  //   - neither                     -> could be text_response or audio_response
  //     (confirmed unresolvable from content alone — e.g. summarizeSpokenText
  //     is text_response but still carries a prompt audioUrl) — show both a
  //     text box and a record-audio control, submit whichever the student
  //     actually used.
  if (content.blanks && content.blanks.length > 0) {
    if (content.text?.includes(BLANK_TOKEN)) {
      return (
        <InlineBlankText
          text={content.text}
          blanks={content.blanks}
          options={content.options ?? []}
          mode="dropdown"
          blankAnswers={response.blankAnswers ?? []}
          onChange={(blankAnswers) => onChange({ blankAnswers })}
        />
      );
    }
    return (
      <BlankFillQuestion
        content={content}
        response={response}
        onChange={onChange}
      />
    );
  }

  if (content.options && content.options.length > 0) {
    return (
      <ChoiceQuestion
        content={content}
        response={response}
        onChange={onChange}
        multi
      />
    );
  }

  if (looksLikeDialogue(content.text)) {
    return (
      <DialogueQuestion
        content={content}
        response={response}
        onChange={onChange}
      />
    );
  }

  return (
    <div className="space-y-4">
      <TextQuestion content={content} response={response} onChange={onChange} />
      <AudioQuestion
        content={content}
        response={response}
        onChange={onChange}
      />
    </div>
  );
}
