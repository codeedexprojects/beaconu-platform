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
  maxCapacity: number;
  isOff: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    collegeId: row.collegeId,
    weekday: WEEKDAY_NAMES[row.weekday],
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
    maxCapacity: 1,
    isOff: true,
    createdAt: null,
    updatedAt: null,
  };
}

export class CampusVisitAvailabilityService {
  static async upsert(collegeId: string, data: UpsertAvailabilityInput) {
    const row = await CampusVisitAvailabilityRepository.upsert(
      collegeId,
      data.weekday,
      {
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
