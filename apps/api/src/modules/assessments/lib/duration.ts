/** Extra grace time added on top of the sum of question time limits —
 * covers reading/loading/transition time between questions so a student
 * isn't auto-submitted right at the exact second the raw question-time
 * total elapses. Applied once here so every consumer (student-facing
 * countdown, fixed-slot window end, auto-submit deadline) stays in sync
 * rather than drifting apart. */
const DURATION_BUFFER_SECS = 5 * 60;

/** An attempt's real total duration is the sum of its paper's questions'
 * individual time_limit_secs (plus DURATION_BUFFER_SECS) — not the
 * admin-declared AssessmentTemplate.totalDurationMins — per the explicit
 * product rule that total assessment time is the sum of all question
 * times. */
export function computePaperDurationSecs(
  paperQuestions: { question: { timeLimitSecs: number } }[],
): number {
  const questionTimeSecs = paperQuestions.reduce(
    (sum, pq) => sum + pq.question.timeLimitSecs,
    0,
  );
  return questionTimeSecs + DURATION_BUFFER_SECS;
}

/** Same reasoning as computePaperDurationSecs, for marks — the template no
 * longer declares totalMarks either; the real total is always the sum of
 * the approved paper's questions' actual marks (same source
 * EvaluationService.publish() already sums independently for scoring). */
export function computePaperTotalMarks(
  paperQuestions: { question: { marks: number | { toString(): string } } }[],
): number {
  return paperQuestions.reduce((sum, pq) => sum + Number(pq.question.marks), 0);
}
