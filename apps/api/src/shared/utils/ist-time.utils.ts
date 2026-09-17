/** Colleges schedule in India time. @db.Date / @db.Time columns hold the
 * IST wall-clock value as-is (a 9:00 AM visit is stored as 09:00), so any
 * comparison with `new Date()` — a real UTC instant — must first turn that
 * wall-clock value into an instant, or it is off by 5h30m. */
export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Combine a @db.Date and a @db.Time holding IST wall-clock values into the
 * real UTC instant they describe. */
export function istWallTimeToInstant(date: Date, time: Date): Date {
  const wallClockAsUtc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    time.getUTCHours(),
    time.getUTCMinutes(),
    time.getUTCSeconds(),
  );
  return new Date(wallClockAsUtc - IST_OFFSET_MS);
}

/** Today's date in India as YYYY-MM-DD. `toISOString()` gives the UTC date,
 * which is still "yesterday" between 00:00 and 05:30 IST. */
export function istDateString(now: Date = new Date()): string {
  return new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** Today's India date as a @db.Date-comparable value (UTC midnight of the
 * IST calendar date). */
export function istToday(now: Date = new Date()): Date {
  return new Date(`${istDateString(now)}T00:00:00Z`);
}

/** The real instant India's current day began (00:00 IST), for comparing
 * against timestamptz columns such as resolvedAt. */
export function istStartOfDayInstant(now: Date = new Date()): Date {
  return new Date(istToday(now).getTime() - IST_OFFSET_MS);
}
