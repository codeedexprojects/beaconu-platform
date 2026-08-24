import { randomUUID } from "crypto";
import { prisma } from "@beaconu/db";
import type { Prisma } from "@beaconu/db";

type Tx = Prisma.TransactionClient;

const LIST_SELECT = {
  id: true,
  ticketNumber: true,
  type: true,
  subject: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

const PLATFORM_LIST_SELECT = {
  ...LIST_SELECT,
  collegeId: true,
  college: { select: { name: true } },
  raiser: { select: { fullName: true } },
} as const;

function buildSearchFilter(search: string) {
  return {
    OR: [
      { subject: { contains: search, mode: "insensitive" as const } },
      { ticketNumber: { contains: search, mode: "insensitive" as const } },
    ],
  };
}

export class PlatformTicketRepository {
  static async create(
    tx: Tx,
    data: {
      collegeId: string;
      raisedBy: string;
      type: string;
      subject: string;
      description: string;
      phoneNumber: string | null;
      preferredTime: string | null;
      attachments: unknown[];
    },
  ) {
    return tx.platformTicket.create({
      data: {
        collegeId: data.collegeId,
        raisedBy: data.raisedBy,
        type: data.type,
        subject: data.subject,
        description: data.description,
        phoneNumber: data.phoneNumber,
        preferredTime: data.preferredTime,
        attachments: data.attachments as Prisma.InputJsonValue[],
        ticketNumber: randomUUID().slice(0, 30),
        status: "awaiting_response",
      },
    });
  }

  static async setTicketNumber(tx: Tx, id: string, ticketNumber: string) {
    return tx.platformTicket.update({
      where: { id },
      data: { ticketNumber },
    });
  }

  static async createMessage(
    client: Tx | typeof prisma,
    data: {
      ticketId: string;
      senderType: "college" | "platform_admin";
      senderId: string | null;
      message: string;
      attachments: unknown[];
      isSystem?: boolean;
    },
  ) {
    return client.platformTicketMessage.create({
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

  static async findByIdForCollege(id: string, collegeId: string) {
    return prisma.platformTicket.findFirst({ where: { id, collegeId } });
  }

  static async findById(id: string) {
    return prisma.platformTicket.findUnique({ where: { id } });
  }

  static async findStaffPhone(staffId: string) {
    return prisma.staffMember.findUnique({
      where: { id: staffId },
      select: { phoneNumber: true },
    });
  }

  static async listForCollege(
    collegeId: string,
    filters: { status?: string; type?: string; search?: string },
    pagination: { page: number; limit: number },
  ) {
    const where = {
      collegeId,
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type }),
      ...(filters.search && buildSearchFilter(filters.search)),
    };

    const [rows, total] = await prisma.$transaction([
      prisma.platformTicket.findMany({
        where,
        select: LIST_SELECT,
        orderBy: { updatedAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.platformTicket.count({ where }),
    ]);

    return { rows, total };
  }

  static async listForPlatform(
    filters: {
      status?: string;
      type?: string;
      collegeId?: string;
      search?: string;
    },
    pagination: { page: number; limit: number },
  ) {
    const where = {
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type }),
      ...(filters.collegeId && { collegeId: filters.collegeId }),
      ...(filters.search && {
        OR: [
          ...buildSearchFilter(filters.search).OR,
          {
            college: {
              name: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
          },
        ],
      }),
    };

    const [rows, total] = await prisma.$transaction([
      prisma.platformTicket.findMany({
        where,
        select: PLATFORM_LIST_SELECT,
        orderBy: { updatedAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.platformTicket.count({ where }),
    ]);

    return { rows, total };
  }

  static async updateStatus(
    id: string,
    data: {
      status: string;
      resolvedAt?: Date | null;
      closedAt?: Date | null;
      assignedTo?: string;
    },
  ) {
    return prisma.platformTicket.update({ where: { id }, data });
  }
}
