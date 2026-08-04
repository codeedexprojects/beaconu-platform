import { prisma, Prisma } from "@beaconu/db";

const SLOT_SELECT = {
  id: true,
  collegeId: true,
  mode: true,
  scheduledDate: true,
  startTime: true,
  endTime: true,
  durationMins: true,
  maxCapacity: true,
  bookedCount: true,
  zoomMeetingUrl: true,
  zoomMeetingId: true,
  zoomPasscode: true,
  googleEventId: true,
  campusId: true,
  campus: {
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      state: true,
      pinCode: true,
      latitude: true,
      longitude: true,
    },
  },
  venue: true,
  interviewerId: true,
  interviewer: { select: { fullName: true, email: true } },
  status: true,
  createdAt: true,
} as const;

export interface InterviewSlotCreateData {
  mode: string;
  scheduledDate: Date;
  startTime: Date;
  endTime: Date;
  durationMins?: number;
  campusId?: string;
  venue?: string;
  interviewerId?: string;
}

export class InterviewSlotRepository {
  static async findCampusInCollege(campusId: string, collegeId: string) {
    return prisma.campus.findFirst({
      where: { id: campusId, collegeId },
      select: { id: true },
    });
  }

  static async create(collegeId: string, data: InterviewSlotCreateData) {
    return prisma.interviewSlot.create({
      data: {
        collegeId,
        mode: data.mode,
        scheduledDate: data.scheduledDate,
        startTime: data.startTime,
        endTime: data.endTime,
        ...(data.durationMins !== undefined && {
          durationMins: data.durationMins,
        }),
        campusId: data.campusId,
        venue: data.venue,
        interviewerId: data.interviewerId,
      },
      select: SLOT_SELECT,
    });
  }

  static async findById(id: string) {
    return prisma.interviewSlot.findUnique({
      where: { id },
      select: SLOT_SELECT,
    });
  }

  static async listByCollege(
    collegeId: string,
    filters: { mode?: string; status?: string } = {},
  ) {
    return prisma.interviewSlot.findMany({
      where: {
        collegeId,
        ...(filters.mode && { mode: filters.mode }),
        ...(filters.status && { status: filters.status }),
      },
      select: SLOT_SELECT,
      orderBy: [{ scheduledDate: "asc" }, { startTime: "asc" }],
    });
  }

  static async listAvailableForCollege(
    collegeId: string,
    filters: {
      mode?: string;
      scheduledDate?: Date;
      dateFrom?: Date;
      dateTo?: Date;
      page: number;
      limit: number;
    },
  ) {
    const dateWhere = filters.scheduledDate
      ? { scheduledDate: filters.scheduledDate }
      : filters.dateFrom || filters.dateTo
        ? {
            scheduledDate: {
              ...(filters.dateFrom && { gte: filters.dateFrom }),
              ...(filters.dateTo && { lte: filters.dateTo }),
            },
          }
        : { scheduledDate: { gte: new Date(new Date().toDateString()) } };

    const where = {
      collegeId,
      status: "active" as const,
      ...dateWhere,
      ...(filters.mode && { mode: filters.mode }),
    };

    const [rows, total] = await prisma.$transaction([
      prisma.interviewSlot.findMany({
        where,
        select: SLOT_SELECT,
        orderBy: [{ scheduledDate: "asc" }, { startTime: "asc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.interviewSlot.count({ where }),
    ]);

    return { rows, total };
  }

  static async update(id: string, data: Partial<InterviewSlotCreateData>) {
    return prisma.interviewSlot.update({
      where: { id },
      data: {
        ...(data.mode !== undefined && { mode: data.mode }),
        ...(data.scheduledDate !== undefined && {
          scheduledDate: data.scheduledDate,
        }),
        ...(data.startTime !== undefined && { startTime: data.startTime }),
        ...(data.endTime !== undefined && { endTime: data.endTime }),
        ...(data.durationMins !== undefined && {
          durationMins: data.durationMins,
        }),
        ...(data.campusId !== undefined && { campusId: data.campusId }),
        ...(data.venue !== undefined && { venue: data.venue }),
        ...(data.interviewerId !== undefined && {
          interviewerId: data.interviewerId,
        }),
      },
      select: SLOT_SELECT,
    });
  }

  static async findExpiredActive(beforeDate: Date) {
    return prisma.interviewSlot.findMany({
      where: { status: "active", scheduledDate: { lt: beforeDate } },
      select: { id: true, collegeId: true },
    });
  }

  static async setStatus(id: string, status: "active" | "cancelled") {
    return prisma.interviewSlot.update({
      where: { id },
      data: { status },
      select: SLOT_SELECT,
    });
  }

  static async incrementBooked(
    tx: Prisma.TransactionClient,
    id: string,
  ): Promise<boolean> {
    const result = await tx.$executeRaw`
      UPDATE interview_slots
      SET booked_count = booked_count + 1
      WHERE id = ${id} AND booked_count < max_capacity
    `;
    return result > 0;
  }

  static async decrementBooked(tx: Prisma.TransactionClient, id: string) {
    await tx.interviewSlot.update({
      where: { id },
      data: { bookedCount: { decrement: 1 } },
    });
  }

  /** Best-effort follow-up write after auto-creating (or updating) the
   * Google Calendar/Meet event for a "gmeet" slot — mirrors
   * CounsellingSession's meetingUrl/meetingId/googleEventId update. */
  static async updateMeetingInfo(
    id: string,
    data: {
      meetingUrl: string;
      meetingId: string | null;
      googleEventId: string;
    },
  ) {
    await prisma.interviewSlot.update({
      where: { id },
      data: {
        zoomMeetingUrl: data.meetingUrl,
        ...(data.meetingId ? { zoomMeetingId: data.meetingId } : {}),
        googleEventId: data.googleEventId,
      },
    });
  }
}
