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
