import { prisma } from "@beaconu/db";

export class CampusVisitSettingsRepository {
  static async findByCollege(collegeId: string) {
    return prisma.campusVisitSettings.findUnique({ where: { collegeId } });
  }

  static async upsert(collegeId: string, startTime: string, endTime: string) {
    const startValue = new Date(`1970-01-01T${startTime}:00Z`);
    const endValue = new Date(`1970-01-01T${endTime}:00Z`);
    return prisma.campusVisitSettings.upsert({
      where: { collegeId },
      create: { collegeId, visitStartTime: startValue, visitEndTime: endValue },
      update: { visitStartTime: startValue, visitEndTime: endValue },
    });
  }
}
