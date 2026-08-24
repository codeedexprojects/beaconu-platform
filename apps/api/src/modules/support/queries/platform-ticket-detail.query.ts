import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import type { PlatformTicketAttachmentItem } from "@beaconu/types";

const TICKET_SELECT = {
  id: true,
  ticketNumber: true,
  type: true,
  subject: true,
  status: true,
  collegeId: true,
  phoneNumber: true,
  preferredTime: true,
  resolvedAt: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
  raiser: { select: { id: true, fullName: true } },
} as const;

type TicketRow = {
  id: string;
  ticketNumber: string;
  type: string;
  subject: string;
  status: string;
  collegeId: string;
  phoneNumber: string | null;
  preferredTime: string | null;
  resolvedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  raiser: { id: string; fullName: string };
};

/** Messages are paginated newest-page-first: when `page` is omitted, the
 * last (most recent) page is returned so the thread opens scrolled to the
 * latest messages, same as a normal chat UI. */
async function assemble(
  row: TicketRow,
  pagination: { page?: number; limit: number },
) {
  const { limit } = pagination;
  const total = await prisma.platformTicketMessage.count({
    where: { ticketId: row.id },
  });
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = pagination.page ?? totalPages;

  const messages = await prisma.platformTicketMessage.findMany({
    where: { ticketId: row.id },
    orderBy: { createdAt: "asc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const adminIds = Array.from(
    new Set(
      messages
        .filter((m) => m.senderType === "platform_admin" && m.senderId)
        .map((m) => m.senderId as string),
    ),
  );
  const adminRows = adminIds.length
    ? await prisma.platformAdmin.findMany({
        where: { id: { in: adminIds } },
        select: { id: true, fullName: true },
      })
    : [];
  const adminNameById = new Map(adminRows.map((a) => [a.id, a.fullName]));

  return {
    id: row.id,
    ticketNumber: row.ticketNumber,
    type: row.type as "query" | "call_request",
    subject: row.subject,
    status: row.status,
    collegeId: row.collegeId,
    phoneNumber: row.phoneNumber,
    preferredTime: row.preferredTime,
    resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
    closedAt: row.closedAt ? row.closedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    messages: messages.map((m) => ({
      id: m.id,
      senderType: m.senderType as "college" | "platform_admin",
      senderName:
        m.senderType === "college"
          ? row.raiser.fullName
          : (m.senderId && adminNameById.get(m.senderId)) || "Platform Support",
      message: m.message,
      attachments: (m.attachments ??
        []) as unknown as PlatformTicketAttachmentItem[],
      isSystem: m.isSystem,
      createdAt: m.createdAt.toISOString(),
    })),
    messagesMeta: PaginationHelper.createMeta(total, page, limit),
  };
}

export class PlatformTicketDetailQuery {
  static async getForCollege(
    collegeId: string,
    ticketId: string,
    messagePagination: { page?: number; limit: number },
  ) {
    const row = await prisma.platformTicket.findFirst({
      where: { id: ticketId, collegeId },
      select: TICKET_SELECT,
    });
    if (!row) throw new NotFoundError("Query not found");
    return assemble(row, messagePagination);
  }

  static async getForPlatform(
    ticketId: string,
    messagePagination: { page?: number; limit: number },
  ) {
    const row = await prisma.platformTicket.findUnique({
      where: { id: ticketId },
      select: TICKET_SELECT,
    });
    if (!row) throw new NotFoundError("Query not found");
    return assemble(row, messagePagination);
  }
}
