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
  // Columns are still named "zoom*" from the schema's original design —
  // reused generically for whatever online-meeting provider is actually
  // configured (Google Meet in practice). Cosmetic mismatch, not fixed
  // here (would need a migration for zero functional benefit).
  zoomMeetingUrl: true,
  zoomMeetingId: true,
  zoomPasscode: true,
  googleEventId: true,
  phoneNumber: true,
  venue: true,
  interviewerId: true,
  interviewer: { select: { fullName: true, email: true } },
  status: true,
  createdAt: true,
} as const;

// No meetingUrl/meetingId/meetingPasscode here — for "gmeet" slots those
// are always written separately via updateMeetingInfo(), once the Google
// Meet event has actually been created. No phoneNumber either —
// "telephonic" interviews use the student's own number (see
// InterviewBookingItem.studentPhone), never a college-entered one.
export interface InterviewSlotCreateData {
  mode: string;
  scheduledDate: Date;
  startTime: Date;
  endTime: Date;
  durationMins?: number;
  maxCapacity?: number;
  venue?: string;
  interviewerId?: string;
}

export class InterviewSlotRepository {
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
        ...(data.maxCapacity !== undefined && {
          maxCapacity: data.maxCapacity,
        }),
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

  /** Available-for-booking slots — active, upcoming, with open capacity. */
  static async listAvailableForCollege(collegeId: string, mode?: string) {
    return prisma.interviewSlot.findMany({
      where: {
        collegeId,
        status: "active",
        scheduledDate: { gte: new Date(new Date().toDateString()) },
        ...(mode && { mode }),
      },
      select: SLOT_SELECT,
      orderBy: [{ scheduledDate: "asc" }, { startTime: "asc" }],
    });
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
        ...(data.maxCapacity !== undefined && {
          maxCapacity: data.maxCapacity,
        }),
        ...(data.venue !== undefined && { venue: data.venue }),
        ...(data.interviewerId !== undefined && {
          interviewerId: data.interviewerId,
        }),
      },
      select: SLOT_SELECT,
    });
  }

  static async setStatus(id: string, status: "active" | "cancelled") {
    return prisma.interviewSlot.update({
      where: { id },
      data: { status },
      select: SLOT_SELECT,
    });
  }

  /** Atomically claims one seat — the conditional `bookedCount: { lt:
   * maxCapacity }` in the WHERE clause means this only ever succeeds if
   * capacity was actually available at the moment of the update, closing
   * the race a plain read-then-write would leave open. Returns the
   * updated count of affected rows (0 = slot was full or didn't exist). */
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
