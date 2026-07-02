import type { CampusVisitAvailabilityEntry, WeekdayName } from "@beaconu/types";

const WEEKDAY_NAMES: WeekdayName[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const BOOKING_WINDOW_DAYS = 90;

export interface BookableDate {
  date: string;
  time: string | null;
}

export function getBookableDates(
  entries: CampusVisitAvailabilityEntry[],
  days: number = BOOKING_WINDOW_DAYS,
): BookableDate[] {
  const byWeekday = new Map(entries.map((entry) => [entry.weekday, entry]));
  const dates: BookableDate[] = [];

  const cursor = new Date();
  for (let i = 0; i < days; i++) {
    const weekdayName = WEEKDAY_NAMES[cursor.getUTCDay()]!;
    const entry = byWeekday.get(weekdayName);
    if (entry && !entry.isOff && entry.time) {
      dates.push({
        date: cursor.toISOString().split("T")[0]!,
        time: entry.time,
      });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

export function formatBookableDateLabel(dateStr: string, time: string | null) {
  const label = new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return time ? `${label} at ${time}` : label;
}
