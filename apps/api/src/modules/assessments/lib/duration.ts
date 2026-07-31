/** Extra grace time added on top of the total — covers reading/loading/
 * transition time between questions so a student isn't auto-submitted
 * right at the exact second the raw total elapses. Applied once here so
 * every consumer (student-facing countdown, fixed-slot window end,
 * auto-submit deadline) stays in sync rather than drifting apart. */
const DURATION_BUFFER_SECS = 5 * 60;

/** An attempt's real total duration is the sum of the template's
 * sections' own time_limit_mins (plus DURATION_BUFFER_SECS) — this is
 * the admin-declared, per-section value shown on the template builder,
 * so setting e.g. 10/10/10 mins per section actually adds up to the
 * total shown to the student and enforced by auto-submit. This
 * deliberately does NOT sum individual Question.time_limit_secs values —
 * those stay independent, per-question on-screen countdowns
 * (AttemptQuestionItem.timeLimitSecs), not what the overall attempt
 * clock is measured against. */
export function computeTemplateDurationSecs(
  templateSections: { timeLimitMins: number }[],
): number {
  const sectionTimeSecs = templateSections.reduce(
    (sum, ts) => sum + ts.timeLimitMins * 60,
    0,
  );
  return sectionTimeSecs + DURATION_BUFFER_SECS;
}

/** The template no longer declares totalMarks either; the real total is
 * always the sum of the approved paper's questions' actual marks (same
 * source EvaluationService.publish() already sums independently for
 * scoring) — unlike duration, this one genuinely needs the paper's actual
 * questions, not the template's own fields, since marks aren't declared
 * per-section anywhere. */
export function computePaperTotalMarks(
  paperQuestions: { question: { marks: number | { toString(): string } } }[],
): number {
  return paperQuestions.reduce((sum, pq) => sum + Number(pq.question.marks), 0);
}
