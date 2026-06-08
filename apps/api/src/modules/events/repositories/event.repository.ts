import { prisma } from "@beaconu/db";
import type { Prisma } from "@beaconu/db";

const EVENT_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
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
  onlineLink: true,
  isFree: true,
  ticketPrice: true,
  totalSeats: true,
  registeredCount: true,
  hasRecording: true,
  recordingUrl: true,
  recordingDuration: true,
  recordedAt: true,
  collegeId: true,
  status: true,
  createdByType: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
} as const;

const EVENT_LIST_SELECT = {
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
  createdAt: true,
} as const;

export class EventRepository {
  static async create(
    data: Prisma.EventCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const db = tx ?? prisma;
    return db.event.create({
      data,
      select: EVENT_SELECT,
    });
  }

  static async findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      select: EVENT_SELECT,
    });
  }

  static async findBySlug(slug: string) {
    return prisma.event.findUnique({
      where: { slug },
      select: EVENT_SELECT,
    });
  }

  static async findAll(
    filters: {
      status?: string;
      category?: string;
      eventMode?: string;
      isFree?: boolean;
      hasRecording?: boolean;
      search?: string;
      fromDate?: string;
    } = {},
    page: number = 1,
    limit: number = 10,
  ) {
    const p = Number(page) || 1;
    const l = Number(limit) || 10;
    const where: Prisma.EventWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.eventMode ? { eventMode: filters.eventMode } : {}),
      ...(filters.isFree !== undefined ? { isFree: filters.isFree } : {}),
      ...(filters.hasRecording !== undefined
        ? { hasRecording: filters.hasRecording }
        : {}),
      ...(filters.search
        ? { title: { contains: filters.search, mode: "insensitive" as const } }
        : {}),
      ...(filters.fromDate
        ? { eventDate: { gte: new Date(filters.fromDate) } }
        : {}),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        select: EVENT_LIST_SELECT,
        orderBy: { eventDate: "desc" },
        skip: (p - 1) * l,
        take: l,
      }),
      prisma.event.count({ where }),
    ]);

    return { events, total };
  }

  static async findUpcoming(
    page: number = 1,
    limit: number = 10,
    filters: {
      category?: string;
      eventMode?: string;
      isFree?: boolean;
      search?: string;
    } = {},
  ) {
    const p = Number(page) || 1;
    const l = Number(limit) || 10;
    const where: Prisma.EventWhereInput = {
      status: "published",
      eventDate: { gte: new Date() },
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.eventMode ? { eventMode: filters.eventMode } : {}),
      ...(filters.isFree !== undefined ? { isFree: filters.isFree } : {}),
      ...(filters.search
        ? {
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
          }
        : {}),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        select: EVENT_LIST_SELECT,
        orderBy: { eventDate: "asc" },
        skip: (p - 1) * l,
        take: l,
      }),
      prisma.event.count({ where }),
    ]);

    return { events, total };
  }

  static async updateById(
    id: string,
    data: Prisma.EventUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const db = tx ?? prisma;
    return db.event.update({
      where: { id },
      data,
      select: EVENT_SELECT,
    });
  }

  static async softDeleteById(id: string) {
    return prisma.event.update({
      where: { id },
      data: { status: "archived" },
      select: EVENT_SELECT,
    });
  }

  static async incrementRegisteredCount(
    id: string,
    tx?: Prisma.TransactionClient,
  ) {
    const db = tx ?? prisma;
    return db.event.update({
      where: { id },
      data: { registeredCount: { increment: 1 } },
      select: { registeredCount: true, totalSeats: true },
    });
  }

  static async decrementRegisteredCount(
    id: string,
    tx?: Prisma.TransactionClient,
  ) {
    const db = tx ?? prisma;
    return db.event.update({
      where: { id },
      data: { registeredCount: { decrement: 1 } },
      select: { registeredCount: true },
    });
  }
}
