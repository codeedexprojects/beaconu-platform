import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import type { TicketAttachmentItem } from "@beaconu/types";

const TICKET_SELECT = {
  id: true,
  ticketNumber: true,
  subject: true,
  status: true,
  collegeId: true,
  studentId: true,
  resolvedAt: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
  student: { select: { id: true, fullName: true } },
} as const;

type TicketRow = {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  collegeId: string;
  studentId: string;
  resolvedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  student: { id: string; fullName: string };
};

async function assemble(row: TicketRow) {
  const messages = await prisma.ticketMessage.findMany({
    where: { ticketId: row.id },
    orderBy: { createdAt: "asc" },
  });

  const staffIds = Array.from(
    new Set(
      messages
        .filter((m) => m.senderType === "staff" && m.senderId)
        .map((m) => m.senderId as string),
    ),
  );
  const staffRows = staffIds.length
    ? await prisma.staffMember.findMany({
        where: { id: { in: staffIds } },
        select: { id: true, fullName: true },
      })
    : [];
  const staffNameById = new Map(staffRows.map((s) => [s.id, s.fullName]));

  return {
    id: row.id,
    ticketNumber: row.ticketNumber,
    subject: row.subject,
    status: row.status,
    collegeId: row.collegeId,
    studentId: row.studentId,
    resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
    closedAt: row.closedAt ? row.closedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    messages: messages.map((m) => ({
      id: m.id,
      senderType: m.senderType as "student" | "staff",
      senderName:
        m.senderType === "student"
          ? row.student.fullName
          : (m.senderId && staffNameById.get(m.senderId)) || "Support Agent",
      message: m.message,
      attachments: (m.attachments ?? []) as unknown as TicketAttachmentItem[],
      isSystem: m.isSystem,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

export class TicketDetailQuery {
  static async getForStudent(studentId: string, ticketId: string) {
    const row = await prisma.supportTicket.findFirst({
      where: { id: ticketId, studentId },
      select: TICKET_SELECT,
    });
    if (!row) throw new NotFoundError("Query not found");
    return assemble(row);
  }

  static async getForCollege(collegeId: string, ticketId: string) {
    const row = await prisma.supportTicket.findFirst({
      where: { id: ticketId, collegeId },
      select: TICKET_SELECT,
    });
    if (!row) throw new NotFoundError("Query not found");
    return assemble(row);
  }
}
