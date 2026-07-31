// Same "@db.Date"/"@db.Time" <-> string conversion idiom already used in
// counselling/services/sessions.service.ts — kept local to this module
// rather than shared, since it's a two-line helper.

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

/** scheduledDate (@db.Date) and startTime/endTime (@db.Time) are separate
 * columns — Prisma returns the time ones as an epoch-date Date with only
 * the time-of-day meaningful. Combine into a slot's real instant (e.g.
 * its actual start moment) for comparisons against `now`. */
export function combineDateAndTime(date: Date, time: Date): Date {
  const combined = new Date(date);
  combined.setUTCHours(
    time.getUTCHours(),
    time.getUTCMinutes(),
    time.getUTCSeconds(),
    0,
  );
  return combined;
}
