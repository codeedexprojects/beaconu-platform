import type {
  AnswerKey,
  AnswerResponse,
  NegativeMarkingMode,
} from "@beaconu/types";

const CHOICE_FORMATS = ["single_choice", "multi_choice"];
const ORDERED_FORMATS = ["ranking", "sequence"];
const FILL_BLANK_FORMATS = ["fill_blank_drag_drop", "fill_blank_dropdown"];

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((v) => setB.has(v));
}

function sameOrder(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function isCorrect(
  responseFormat: string,
  answerKey: AnswerKey | null,
  response: AnswerResponse | null,
): boolean {
  if (!answerKey || !response) return false;

  if (CHOICE_FORMATS.includes(responseFormat)) {
    return sameSet(
      response.selectedOptionIds ?? [],
      answerKey.correctOptionIds ?? [],
    );
  }

  if (ORDERED_FORMATS.includes(responseFormat)) {
    return sameOrder(response.order ?? [], answerKey.correctOrder ?? []);
  }

  if (FILL_BLANK_FORMATS.includes(responseFormat)) {
    const expected = answerKey.blankAnswers ?? [];
    const given = response.blankAnswers ?? [];
    if (expected.length === 0 || given.length !== expected.length) return false;
    const givenByBlank = new Map(given.map((b) => [b.blankId, b.optionId]));
    return expected.every((b) => givenByBlank.get(b.blankId) === b.optionId);
  }

  return false;
}

/** Only meaningful for autoScorable question types — returns null otherwise,
 * since non-autoscorable answers are always evaluator-scored, never machine-scored.
 * "proportional" negative marking has no partial-credit model in this schema
 * (no schema field for it), so it's treated identically to "fixed". */
export function scoreAutoAnswer(params: {
  autoScorable: boolean;
  responseFormat: string;
  answerKey: AnswerKey | null;
  response: AnswerResponse | null;
  marks: number;
  negativeMarks: number;
  negativeMarkingMode: NegativeMarkingMode;
}): number | null {
  if (!params.autoScorable) return null;

  if (isCorrect(params.responseFormat, params.answerKey, params.response)) {
    return params.marks;
  }
  if (params.negativeMarkingMode === "none") return 0;
  return -params.negativeMarks;
}
