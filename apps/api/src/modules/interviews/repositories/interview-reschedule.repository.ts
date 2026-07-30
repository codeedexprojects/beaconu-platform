import { prisma, Prisma } from "@beaconu/db";

const RESCHEDULE_SELECT = {
  id: true,
  bookingId: true,
  studentId: true,
  fromSlotId: true,
  toSlotId: true,
  reason: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  reviewRemarks: true,
  createdAt: true,
} as const;

export class InterviewRescheduleRepository {
  static async create(data: {
    bookingId: string;
    studentId: string;
    fromSlotId: string;
    toSlotId?: string;
    reason: string;
  }) {
    return prisma.interviewReschedule.create({
      data,
      select: RESCHEDULE_SELECT,
    });
  }

  static async findById(id: string) {
    return prisma.interviewReschedule.findUnique({
      where: { id },
      select: RESCHEDULE_SELECT,
    });
  }

  static async countNonRejectedForBooking(bookingId: string) {
    return prisma.interviewReschedule.count({
      where: { bookingId, status: { not: "rejected" } },
    });
  }

  static async listForBooking(bookingId: string) {
    return prisma.interviewReschedule.findMany({
      where: { bookingId },
      select: RESCHEDULE_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async listForCollege(
    collegeId: string,
    filters: { status?: string } = {},
  ) {
    return prisma.interviewReschedule.findMany({
      where: {
        booking: { slot: { collegeId } },
        ...(filters.status && { status: filters.status }),
      },
      select: RESCHEDULE_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateReview(
    tx: Prisma.TransactionClient,
    id: string,
    data: {
      status: string;
      toSlotId?: string;
      reviewedBy: string;
      reviewRemarks?: string;
    },
  ) {
    return tx.interviewReschedule.update({
      where: { id },
      data: {
        status: data.status,
        ...(data.toSlotId !== undefined && { toSlotId: data.toSlotId }),
        reviewedBy: data.reviewedBy,
        reviewedAt: new Date(),
        reviewRemarks: data.reviewRemarks,
      },
      select: RESCHEDULE_SELECT,
    });
  }
}
