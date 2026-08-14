import { randomUUID } from "crypto";
import { prisma } from "@beaconu/db";
import type { Prisma } from "@beaconu/db";

type Tx = Prisma.TransactionClient;

const LIST_SELECT = {
  id: true,
  ticketNumber: true,
  subject: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

const ADMIN_LIST_SELECT = {
  ...LIST_SELECT,
  student: { select: { fullName: true, email: true } },
} as const;

function buildSearchFilter(search: string) {
  return {
    OR: [
      { subject: { contains: search, mode: "insensitive" as const } },
      { ticketNumber: { contains: search, mode: "insensitive" as const } },
    ],
  };
}

export class TicketRepository {
  static async countAwaitingResponseForCollege(collegeId: string) {
    return prisma.supportTicket.count({
      where: { collegeId, status: "awaiting_response" },
    });
  }

  static async create(
    tx: Tx,
    data: {
      studentId: string;
      collegeId: string;
      subject: string;
      description: string;
      attachments: unknown[];
    },
  ) {
    return tx.supportTicket.create({
      data: {
        studentId: data.studentId,
        collegeId: data.collegeId,
        subject: data.subject,
        description: data.description,
        attachments: data.attachments as Prisma.InputJsonValue[],
        // Temporary unique placeholder, immediately overwritten in
        // setTicketNumber() with the row's own id — ticket_number is
        // VarChar(30), so a full 36-char UUID doesn't fit here.
        ticketNumber: randomUUID().slice(0, 30),
        // No admin has responded yet — set explicitly rather than relying
        // on the column default, since that default is now stale (still
        // "in_progress" pending a migration the user will run separately).
        status: "awaiting_response",
      },
    });
  }

  static async setTicketNumber(tx: Tx, id: string, ticketNumber: string) {
    return tx.supportTicket.update({
      where: { id },
      data: { ticketNumber },
    });
  }

  static async createMessage(
    client: Tx | typeof prisma,
    data: {
      ticketId: string;
      senderType: "student" | "staff";
      senderId: string | null;
      message: string;
      attachments: unknown[];
      isSystem?: boolean;
    },
  ) {
    return client.ticketMessage.create({
      data: {
        ticketId: data.ticketId,
        senderType: data.senderType,
        senderId: data.senderId,
        message: data.message,
        attachments: data.attachments as Prisma.InputJsonValue[],
        isSystem: data.isSystem ?? false,
      },
    });
  }

  static async findByIdForStudent(id: string, studentId: string) {
    return prisma.supportTicket.findFirst({ where: { id, studentId } });
  }

  static async findByIdForCollege(id: string, collegeId: string) {
    return prisma.supportTicket.findFirst({ where: { id, collegeId } });
  }

  static async listForStudent(
    studentId: string,
    filters: { status?: string; search?: string },
    pagination: { page: number; limit: number },
  ) {
    const where = {
      studentId,
      ...(filters.status && { status: filters.status }),
      ...(filters.search && buildSearchFilter(filters.search)),
    };

    const [rows, total] = await prisma.$transaction([
      prisma.supportTicket.findMany({
        where,
        select: LIST_SELECT,
        orderBy: { updatedAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return { rows, total };
  }

  static async listForCollege(
    collegeId: string,
    filters: { status?: string; search?: string },
    pagination: { page: number; limit: number },
  ) {
    const where = {
      collegeId,
      ...(filters.status && { status: filters.status }),
      ...(filters.search && {
        OR: [
          ...buildSearchFilter(filters.search).OR,
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
    };

    const [rows, total] = await prisma.$transaction([
      prisma.supportTicket.findMany({
        where,
        select: ADMIN_LIST_SELECT,
        orderBy: { updatedAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return { rows, total };
  }

  static async updateStatus(
    id: string,
    data: { status: string; resolvedAt?: Date | null; closedAt?: Date | null },
  ) {
    return prisma.supportTicket.update({ where: { id }, data });
  }
}
