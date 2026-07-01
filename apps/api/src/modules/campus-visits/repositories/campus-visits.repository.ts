import { prisma } from "@beaconu/db";
import type { CreateCampusVisitInput } from "../validators/campus-visits.validator";

export class CampusVisitsRepository {
  static async create(data: CreateCampusVisitInput & { studentId: string }) {
    return prisma.campusVisit.create({
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
        proposedTime: new Date(`1970-01-01T${data.proposed_time}:00Z`),
        status: "pending",
      },
      include: { ambassador: true },
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
  ) {
    return prisma.campusVisit.update({
      where: { id },
      data: {
        status,
        ...extra,
      },
      include: { ambassador: true },
    });
  }

  static async reschedule(
    id: string,
    proposedDate: Date,
    proposedTime: Date,
    previousProposedDate: Date,
    previousProposedTime: Date,
  ) {
    return prisma.campusVisit.update({
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
