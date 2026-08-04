const DURATION_BUFFER_SECS = 5 * 60;

export function computeTemplateDurationSecs(
  templateSections: { timeLimitMins: number }[],
): number {
  const sectionTimeSecs = templateSections.reduce(
    (sum, ts) => sum + ts.timeLimitMins * 60,
    0,
  );
  return sectionTimeSecs + DURATION_BUFFER_SECS;
}

export function computePaperTotalMarks(
  paperQuestions: { question: { marks: number | { toString(): string } } }[],
): number {
  return paperQuestions.reduce((sum, pq) => sum + Number(pq.question.marks), 0);
}
