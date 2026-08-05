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
  interviewerEmail: true,
  status: true,
  createdAt: true,
} as const;

const BOOKING_SELECT = {
  id: true,
  applicationId: true,
  application: {
    select: {
      applicationNumber: true,
      applicationCourses: {
        where: { status: { not: "withdrawn" } },
        select: { id: true, status: true, course: { select: { name: true } } },
      },
    },
  },
  studentId: true,
  student: { select: { fullName: true, phoneNumber: true } },
  slotId: true,
  slot: { select: SLOT_SELECT },
  status: true,
  interviewScore: true,
  interviewRemarks: true,
  interviewOutcome: true,
  evaluatedBy: true,
  evaluatedAt: true,
  bookedAt: true,
  completedAt: true,
} as const;

export class InterviewBookingRepository {
  static async create(
    tx: Prisma.TransactionClient,
    data: { applicationId: string; studentId: string; slotId: string },
  ) {
    return tx.interviewBooking.create({
      data,
      select: BOOKING_SELECT,
    });
  }

  static async findById(id: string) {
    return prisma.interviewBooking.findUnique({
      where: { id },
      select: BOOKING_SELECT,
    });
  }

  static async findByApplicationId(applicationId: string) {
    return prisma.interviewBooking.findUnique({
      where: { applicationId },
      select: BOOKING_SELECT,
    });
  }

  static async findActiveByStudent(studentId: string) {
    return prisma.interviewBooking.findFirst({
      where: { studentId, status: "booked" },
      select: BOOKING_SELECT,
    });
  }

  static async findByIdForStudent(id: string, studentId: string) {
    return prisma.interviewBooking.findFirst({
      where: { id, studentId },
      select: BOOKING_SELECT,
    });
  }

  static async updateSlot(
    tx: Prisma.TransactionClient,
    id: string,
    slotId: string,
  ) {
    return tx.interviewBooking.update({
      where: { id },
      data: { slotId },
      select: BOOKING_SELECT,
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
      status: string;
      interviewScore?: number;
      interviewOutcome?: string;
      interviewRemarks?: string;
      evaluatedBy: string;
    },
  ) {
    return prisma.interviewBooking.update({
      where: { id },
      data: {
        status: data.status,
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
    filters: { status?: string } = {},
  ) {
    return prisma.interviewBooking.findMany({
      where: {
        slot: { collegeId },
        ...(filters.status && { status: filters.status }),
      },
      select: BOOKING_SELECT,
      orderBy: { bookedAt: "desc" },
    });
  }
}
