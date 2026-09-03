import { prisma } from "@beaconu/db";

export class CampusVisitDateOverrideRepository {
  static async listForCollegeInRange(
    collegeId: string,
    startDate: string,
    endDate: string,
  ) {
    return prisma.campusVisitDateOverride.findMany({
      where: {
        collegeId,
        isActive: true,
        date: {
          gte: new Date(startDate + "T00:00:00Z"),
          lte: new Date(endDate + "T00:00:00Z"),
        },
      },
      orderBy: { date: "asc" },
    });
  }

  static async findByCollegeAndDate(collegeId: string, date: string) {
    return prisma.campusVisitDateOverride.findUnique({
      where: {
        uq_visit_date_override: {
          collegeId,
          date: new Date(date + "T00:00:00Z"),
        },
      },
    });
  }

  /** Upserts rather than always creating fresh — a date can be marked,
   * un-marked, then re-marked as a holiday; the unique (collegeId, date)
   * row is reactivated instead of ever accumulating duplicates. */
  static async upsertActive(
    collegeId: string,
    date: string,
    reason: string | null,
    createdBy: string,
  ) {
    return prisma.campusVisitDateOverride.upsert({
      where: {
        uq_visit_date_override: {
          collegeId,
          date: new Date(date + "T00:00:00Z"),
        },
      },
      create: {
        collegeId,
        date: new Date(date + "T00:00:00Z"),
        reason,
        createdBy,
        isActive: true,
      },
      update: { reason, createdBy, isActive: true },
    });
  }

  static async findByIdForCollege(id: string, collegeId: string) {
    return prisma.campusVisitDateOverride.findFirst({
      where: { id, collegeId, isActive: true },
    });
  }

  static async softDeactivate(id: string) {
    await prisma.campusVisitDateOverride.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
