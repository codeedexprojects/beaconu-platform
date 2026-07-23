/** An attempt's real total duration is the sum of its paper's questions'
 * individual time_limit_secs — not the admin-declared
 * AssessmentTemplate.totalDurationMins — per the explicit product rule
 * that total assessment time is the sum of all question times. */
export function computePaperDurationSecs(
  paperQuestions: { question: { timeLimitSecs: number } }[],
): number {
  return paperQuestions.reduce((sum, pq) => sum + pq.question.timeLimitSecs, 0);
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
