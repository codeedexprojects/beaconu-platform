import { prisma } from "@beaconu/db";

const BOOKING_SELECT = {
  id: true,
  applicationId: true,
  application: {
    select: {
      applicationNumber: true,
      profilePhotoUrl: true,
      applicationCourses: {
        where: { status: { not: "withdrawn" } },
        select: { id: true, status: true, course: { select: { name: true } } },
      },
    },
  },
  studentId: true,
  student: { select: { fullName: true, email: true, phoneNumber: true } },
  collegeId: true,
  status: true,
  mode: true,
  scheduledDate: true,
  startTime: true,
  endTime: true,
  panelMemberId: true,
  panelMember: {
    select: {
      fullName: true,
      email: true,
      collegeRole: { select: { name: true } },
    },
  },
  meetingUrl: true,
  meetingId: true,
  googleEventId: true,
  venue: true,
  scheduledBy: true,
  scheduledAt: true,
  interviewScore: true,
  interviewRemarks: true,
  interviewOutcome: true,
  evaluatedBy: true,
  evaluatedAt: true,
  completedAt: true,
  createdAt: true,
} as const;

export interface ScheduleBookingData {
  mode: string;
  scheduledDate: Date;
  startTime: Date;
  endTime: Date;
  panelMemberId: string;
  venue?: string | null;
  scheduledBy: string;
}

export class InterviewBookingRepository {
  /** Upsert-shaped: creates the row the first time an application is
   * scheduled, or overwrites an existing `cancelled` row's scheduling
   * fields back to `scheduled` on re-schedule — never a second row per
   * application (applicationId stays @unique). */
  static async schedule(
    applicationId: string,
    studentId: string,
    collegeId: string,
    data: ScheduleBookingData,
  ) {
    const writeData = {
      status: "scheduled",
      mode: data.mode,
      scheduledDate: data.scheduledDate,
      startTime: data.startTime,
      endTime: data.endTime,
      panelMemberId: data.panelMemberId,
      venue: data.venue ?? null,
      scheduledBy: data.scheduledBy,
      scheduledAt: new Date(),
    };
    return prisma.interviewBooking.upsert({
      where: { applicationId },
      create: { applicationId, studentId, collegeId, ...writeData },
      update: writeData,
      select: BOOKING_SELECT,
    });
  }

  static async findById(id: string) {
    return prisma.interviewBooking.findUnique({
      where: { id },
      select: BOOKING_SELECT,
    });
  }

  static async findByIdForCollege(id: string, collegeId: string) {
    return prisma.interviewBooking.findFirst({
      where: { id, collegeId },
      select: BOOKING_SELECT,
    });
  }

  static async findByApplicationId(applicationId: string) {
    return prisma.interviewBooking.findUnique({
      where: { applicationId },
      select: BOOKING_SELECT,
    });
  }

  static async findByApplicationIdForStudent(
    applicationId: string,
    studentId: string,
  ) {
    return prisma.interviewBooking.findFirst({
      where: { applicationId, studentId },
      select: BOOKING_SELECT,
    });
  }

  static async updateMeetingInfo(
    id: string,
    data: {
      meetingUrl: string;
      meetingId: string | null;
      googleEventId: string;
    },
  ) {
    await prisma.interviewBooking.update({
      where: { id },
      data: {
        meetingUrl: data.meetingUrl,
        ...(data.meetingId ? { meetingId: data.meetingId } : {}),
        googleEventId: data.googleEventId,
      },
    });
  }

  static async setStatus(id: string, status: string) {
    return prisma.interviewBooking.update({
      where: { id },
      data: { status },
      select: BOOKING_SELECT,
    });
  }

  static async recordOutcome(
    id: string,
    data: {
      interviewScore?: number;
      interviewOutcome?: string;
      interviewRemarks?: string;
      evaluatedBy: string;
    },
  ) {
    return prisma.interviewBooking.update({
      where: { id },
      data: {
        status: "completed",
        interviewScore: data.interviewScore,
        interviewOutcome: data.interviewOutcome,
        interviewRemarks: data.interviewRemarks,
        evaluatedBy: data.evaluatedBy,
        evaluatedAt: new Date(),
        completedAt: new Date(),
      },
      select: BOOKING_SELECT,
    });
  }

  static async listForCollege(
    collegeId: string,
    filters: { status?: string; search?: string } = {},
  ) {
    return prisma.interviewBooking.findMany({
      where: {
        collegeId,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && {
          OR: [
            {
              application: {
                applicationNumber: {
                  contains: filters.search,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              student: {
                fullName: {
                  contains: filters.search,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }),
      },
      select: BOOKING_SELECT,
      orderBy: [{ scheduledDate: "asc" }, { startTime: "asc" }],
    });
  }

  /** Every active StaffMember at the college, for the Panel Member
   * Assignment picker — a direct read into another module's table
   * (`colleges`/`auth`'s StaffMember), matching this codebase's
   * established "duplicate a minimal cross-module read" precedent (e.g.
   * `payments/repositories/application-payment.repository.ts`) rather
   * than adding a full service dependency for one simple list. */
  static async findStaffForCollege(collegeId: string, search?: string) {
    return prisma.staffMember.findMany({
      where: {
        collegeId,
        status: "active",
        ...(search && {
          fullName: { contains: search, mode: "insensitive" as const },
        }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        collegeRole: { select: { name: true } },
      },
      orderBy: { fullName: "asc" },
    });
  }

  /** Staff ids already `scheduled` for another interview on the given date
   * whose [startTime, endTime] overlaps the requested window — the busy
   * set for availability computation. `excludeBookingId` lets a
   * re-schedule ignore the booking's own prior assignment. */
  static async findScheduledOverlapsForStaff(
    staffIds: string[],
    scheduledDate: Date,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string,
  ) {
    if (staffIds.length === 0) return [];
    return prisma.interviewBooking.findMany({
      where: {
        panelMemberId: { in: staffIds },
        status: "scheduled",
        scheduledDate,
        ...(excludeBookingId && { id: { not: excludeBookingId } }),
        NOT: [{ endTime: { lte: startTime } }, { startTime: { gte: endTime } }],
      },
      select: { panelMemberId: true },
    });
  }
}
