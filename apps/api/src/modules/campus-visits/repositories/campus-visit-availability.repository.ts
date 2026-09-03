import { prisma, Prisma } from "@beaconu/db";

type TxClient = Prisma.TransactionClient;

export class CampusVisitAvailabilityRepository {
  static async upsert(
    collegeId: string,
    weekday: number,
    data: { maxCapacity: number; isOff: boolean },
  ) {
    return prisma.campusVisitAvailability.upsert({
      where: {
        uq_visit_availability_college_weekday: { collegeId, weekday },
      },
      create: {
        collegeId,
        weekday,
        maxCapacity: data.maxCapacity,
        isOff: data.isOff,
      },
      update: {
        maxCapacity: data.maxCapacity,
        isOff: data.isOff,
      },
    });
  }

  static async findByCollegeAndWeekday(
    collegeId: string,
    weekday: number,
    tx: TxClient | typeof prisma = prisma,
  ) {
    return tx.campusVisitAvailability.findUnique({
      where: {
        uq_visit_availability_college_weekday: { collegeId, weekday },
      },
    });
  }

  static async listByCollege(collegeId: string) {
    return prisma.campusVisitAvailability.findMany({
      where: { collegeId },
      orderBy: { weekday: "asc" },
    });
  }

  /** Count active (pending/confirmed) visits already booked for a specific calendar date. */
  static async countActiveBookingsForDate(
    collegeId: string,
    date: string,
    tx: TxClient | typeof prisma = prisma,
  ) {
    return tx.campusVisit.count({
      where: {
        collegeId,
        proposedDate: new Date(date + "T00:00:00Z"),
        status: { in: ["pending", "confirmed"] },
      },
    });
  }

  /** Serializes concurrent bookings for the same college+date so the capacity check is race-free. */
  static async lockDateForBooking(
    collegeId: string,
    date: string,
    tx: TxClient,
  ) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${collegeId} || ${date}, 0))`;
  }
}
