export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function parseTimeOnly(value: string): Date {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

export function formatDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function formatTimeOnly(value: Date): string {
  return value.toISOString().slice(11, 16);
}

// Same IST_OFFSET_MS constant/reasoning as
// counselling/services/sessions.service.ts's istWallTimeToInstant —
// scheduledDate/startTime/endTime are stored as raw IST wall-clock values
// (no UTC offset baked in), so combining them naively and comparing
// against `new Date()` (a true UTC instant) would be off by +5:30.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** scheduledDate (@db.Date) and startTime/endTime (@db.Time) are separate
 * columns — Prisma returns the time ones as an epoch-date Date with only
 * the time-of-day meaningful. Combine into the slot's real UTC instant
 * (e.g. its actual start moment) so it can be safely compared against
 * `new Date()`/`Date.now()`. */
export function combineDateAndTime(date: Date, time: Date): Date {
  const naive = new Date(date);
  naive.setUTCHours(
    time.getUTCHours(),
    time.getUTCMinutes(),
    time.getUTCSeconds(),
    0,
  );
  return new Date(naive.getTime() - IST_OFFSET_MS);
}
