import { prisma } from "@beaconu/db";
import type { Prisma } from "@beaconu/db";

const REGISTRATION_SELECT = {
  id: true,
  eventId: true,
  studentId: true,
  paymentStatus: true,
  transactionId: true,
  status: true,
  registeredAt: true,
  cancelledAt: true,
} as const;

export class EventRegistrationRepository {
  static async create(
    data: Prisma.EventRegistrationCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const db = tx ?? prisma;
    return db.eventRegistration.create({
      data,
      select: REGISTRATION_SELECT,
    });
  }

  static async findByEventAndStudent(eventId: string, studentId: string) {
    return prisma.eventRegistration.findFirst({
      where: { eventId, studentId },
      select: REGISTRATION_SELECT,
    });
  }

  static async countByEventAndStatus(eventId: string) {
    const [joinedCount, leftCount] = await Promise.all([
      prisma.eventRegistration.count({
        where: { eventId, status: "registered" },
      }),
      prisma.eventRegistration.count({
        where: { eventId, status: "cancelled" },
      }),
    ]);

    return { joinedCount, leftCount };
  }

  static async findByStudentId(
    studentId: string,
    filters: { status?: string; search?: string } = {},
    page: number = 1,
    limit: number = 10,
  ) {
    const p = Number(page) || 1;
    const l = Number(limit) || 10;
    const where: Prisma.EventRegistrationWhereInput = {
      studentId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search
        ? {
            event: {
              OR: [
                {
                  title: {
                    contains: filters.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  speakerName: {
                    contains: filters.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  organizer: {
                    contains: filters.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  category: {
                    contains: filters.search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            },
          }
        : {}),
    };

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where,
        select: {
          ...REGISTRATION_SELECT,
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImageUrl: true,
              category: true,
              speakerName: true,
              speakerTitle: true,
              organizer: true,
              eventDate: true,
              startTime: true,
              endTime: true,
              duration: true,
              eventMode: true,
              venue: true,
              isFree: true,
              ticketPrice: true,
              totalSeats: true,
              registeredCount: true,
              status: true,
            },
          },
        },
        orderBy: { registeredAt: "desc" },
        skip: (p - 1) * l,
        take: l,
      }),
      prisma.eventRegistration.count({ where }),
    ]);

    return { registrations, total };
  }

  static async findRegisteredEventsWithRecordings(
    studentId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const p = Number(page) || 1;
    const l = Number(limit) || 10;
    const where: Prisma.EventRegistrationWhereInput = {
      studentId,
      status: "registered",
      event: {
        hasRecording: true,
        recordingUrl: { not: null },
        ...(search
          ? {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  speakerName: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  organizer: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  category: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
      },
    };

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where,
        select: {
          ...REGISTRATION_SELECT,
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImageUrl: true,
              category: true,
              speakerName: true,
              speakerTitle: true,
              organizer: true,
              eventDate: true,
              startTime: true,
              endTime: true,
              duration: true,
              eventMode: true,
              venue: true,
              hasRecording: true,
              recordingUrl: true,
              recordingDuration: true,
              recordedAt: true,
              status: true,
            },
          },
        },
        orderBy: { registeredAt: "desc" },
        skip: (p - 1) * l,
        take: l,
      }),
      prisma.eventRegistration.count({ where }),
    ]);

    return { registrations, total };
  }

  static async findByEventId(
    eventId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const p = Number(page) || 1;
    const l = Number(limit) || 10;
    const where: Prisma.EventRegistrationWhereInput = { eventId };

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where,
        select: {
          ...REGISTRATION_SELECT,
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { registeredAt: "desc" },
        skip: (p - 1) * l,
        take: l,
      }),
      prisma.eventRegistration.count({ where }),
    ]);

    return { registrations, total };
  }

  static async cancelRegistration(id: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? prisma;
    return db.eventRegistration.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
      select: REGISTRATION_SELECT,
    });
  }

  static async updateById(
    id: string,
    data: Prisma.EventRegistrationUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const db = tx ?? prisma;
    return db.eventRegistration.update({
      where: { id },
      data,
      select: REGISTRATION_SELECT,
    });
  }

  static async findRegisteredEventIds(studentId: string, eventIds: string[]) {
    if (eventIds.length === 0) return [];

    const rows = await prisma.eventRegistration.findMany({
      where: {
        studentId,
        status: "registered",
        eventId: { in: eventIds },
      },
      select: { eventId: true },
    });

    return rows.map((row) => row.eventId);
  }
}
