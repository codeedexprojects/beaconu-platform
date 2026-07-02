import { ConflictError } from "@/shared/errors";
import { CampusVisitAvailabilityRepository } from "../repositories/campus-visit-availability.repository";
import type { UpsertAvailabilityInput } from "../validators/campus-visit-availability.validator";

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function toDto(row: {
  id: string;
  collegeId: string;
  weekday: number;
  time: Date | null;
  maxCapacity: number;
  isOff: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    collegeId: row.collegeId,
    weekday: WEEKDAY_NAMES[row.weekday],
    time: row.time ? row.time.toISOString().split("T")[1]!.slice(0, 5) : null,
    maxCapacity: row.maxCapacity,
    isOff: row.isOff,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function defaultDto(collegeId: string, weekday: number) {
  return {
    id: null,
    collegeId,
    weekday: WEEKDAY_NAMES[weekday],
    time: null,
    maxCapacity: 1,
    isOff: true,
    createdAt: null,
    updatedAt: null,
  };
}

export class CampusVisitAvailabilityService {
  static async upsert(collegeId: string, data: UpsertAvailabilityInput) {
    if (!data.is_off && !data.time) {
      throw new ConflictError(
        "Time is required for a weekday that is open for visits",
      );
    }

    const row = await CampusVisitAvailabilityRepository.upsert(
      collegeId,
      data.weekday,
      {
        time: data.is_off ? null : (data.time ?? null),
        maxCapacity: data.max_capacity,
        isOff: data.is_off,
      },
    );
    return toDto(row);
  }

  static async listForCollege(collegeId: string) {
    const rows =
      await CampusVisitAvailabilityRepository.listByCollege(collegeId);
    const byWeekday = new Map(rows.map((row) => [row.weekday, row]));

    return WEEKDAY_NAMES.map((_, weekday) => {
      const row = byWeekday.get(weekday);
      return row ? toDto(row) : defaultDto(collegeId, weekday);
    });
  }
}
