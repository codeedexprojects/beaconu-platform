"use client";

import { useEffect, useState } from "react";

// Purely a client-side visual countdown — never auto-submits or auto-advances
// on reaching zero. The backend's real enforcement is the whole-attempt
// duration + tab-hidden anti-cheat sweep (AttemptService.runAutoSubmitSweep);
// duplicating submit-on-zero here would risk the same premature auto-submit
// issue hit during manual QA when the tab lost focus.
//
// resetKey should be stable for the whole attempt (e.g. the attempt id) —
// this counts down continuously across every section/question in one
// attempt, matching the assessment's real total duration (sum of every
// section's timeLimitMins), not a per-section or per-question timer that
// restarts on navigation.
export function useQuestionTimer(
  totalSecs: number | null,
  resetKey: string,
): number | null {
  const [secondsLeft, setSecondsLeft] = useState(totalSecs);

  useEffect(() => {
    setSecondsLeft(totalSecs);
    if (totalSecs === null || totalSecs <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return null;
        return Math.max(0, prev - 1);
      });
    }, 1000);

    return () => clearInterval(interval);
    // totalSecs is intentionally in the dep array despite resetting the
    // countdown on every change — totalSecs only actually changes twice in
    // practice: once when it resolves from null (loading) to the real
    // duration, and again if resetKey changes (a genuinely new attempt).
    // Without it here, a totalSecs that arrives after mount (the common
    // case, since it depends on an async sections fetch) never gets picked
    // up and the timer stays stuck at null forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, totalSecs === null]);

  return secondsLeft;
}
