import { prisma, Prisma } from "@beaconu/db";
import type { CreateCampusVisitInput } from "../validators/campus-visits.validator";

type TxClient = Prisma.TransactionClient | typeof prisma;

export class CampusVisitsRepository {
  static async create(
    data: CreateCampusVisitInput & { studentId: string; proposedTime: Date },
    tx: TxClient = prisma,
  ) {
    return tx.campusVisit.create({
      data: {
        collegeId: data.college_id,
        studentId: data.studentId,
        ambassadorId: data.ambassador_id ?? null,
        studentName: data.full_name,
        email: data.email,
        phoneNumber: data.phone_number,
        courseInterest: data.course_interest ?? null,
        additionalVisitorsCount: data.additional_visitors_count ?? 0,
        guests: data.guests ?? undefined,
        reasonForVisit: data.reason_for_visit,
        proposedDate: new Date(data.proposed_date),
        proposedTime: data.proposedTime,
        status: "pending",
      },
      include: {
        ambassador: true,
        college: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            district: true,
            state: true,
            pinCode: true,
          },
        },
      },
    });
  }

  static async findById(id: string) {
    return prisma.campusVisit.findUnique({
      where: { id },
      include: { ambassador: true },
    });
  }

  static async updateStatus(
    id: string,
    status: string,
    extra?: {
      cancellationReason?: string;
      rejectionReason?: string;
      reassignmentReason?: string;
      ambassadorId?: string | null;
    },
    tx: TxClient = prisma,
  ) {
    return tx.campusVisit.update({
      where: { id },
      data: {
        status,
        ...extra,
      },
      include: { ambassador: true },
    });
  }

  static async findActiveVisitOnDate(
    studentId: string,
    date: string,
    excludeVisitId?: string,
  ) {
    return prisma.campusVisit.findFirst({
      where: {
        studentId,
        proposedDate: new Date(date + "T00:00:00Z"),
        status: { in: ["pending", "confirmed"] },
        ...(excludeVisitId ? { id: { not: excludeVisitId } } : {}),
      },
    });
  }

  static async countByAmbassador(ambassadorId: string) {
    return prisma.campusVisit.groupBy({
      by: ["status"],
      where: { ambassadorId },
      _count: { _all: true },
    });
  }

  /** Active visits proposed for today or tomorrow (UTC) — used by the reminder job. */
  static async findUpcomingActiveVisits(nowUtc: Date) {
    const todayStart = new Date(
      Date.UTC(
        nowUtc.getUTCFullYear(),
        nowUtc.getUTCMonth(),
        nowUtc.getUTCDate(),
      ),
    );
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

    return prisma.campusVisit.findMany({
      where: {
        status: { in: ["pending", "confirmed"] },
        proposedDate: { in: [todayStart, tomorrowStart] },
      },
      select: {
        id: true,
        studentId: true,
        ambassadorId: true,
        studentName: true,
        proposedDate: true,
        proposedTime: true,
      },
    });
  }

  static async reschedule(
    id: string,
    proposedDate: Date,
    proposedTime: Date,
    previousProposedDate: Date,
    previousProposedTime: Date,
    tx: TxClient = prisma,
  ) {
    return tx.campusVisit.update({
      where: { id },
      data: {
        proposedDate,
        proposedTime,
        previousProposedDate,
        previousProposedTime,
        rescheduledAt: new Date(),
        status: "pending",
      },
      include: { ambassador: true },
    });
  }
}
