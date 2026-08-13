import { prisma } from "@beaconu/db";
import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { logger } from "@/shared/lib/logger";
import { PushService } from "@/modules/notifications/services/push.service";
import { EnrollmentService } from "@/modules/admissions/services/enrollment.service";
import { TicketRepository } from "../repositories/ticket.repository";
import { TicketDetailQuery } from "../queries/ticket-detail.query";
import type {
  CreateTicketInput,
  SendTicketMessageInput,
  UpdateTicketStatusInput,
} from "@beaconu/types";

async function notifyStudentOfAdminReply(ticket: {
  id: string;
  studentId: string;
  subject: string;
  ticketNumber: string;
}): Promise<void> {
  try {
    await PushService.sendToUser(ticket.studentId, "student", {
      title: "New reply to your query",
      body: `College support replied to "${ticket.subject}" (#${ticket.ticketNumber.slice(-6).toUpperCase()})`,
      data: { type: "ticket_admin_reply", ticketId: ticket.id },
    });
  } catch (error) {
    logger.error(
      { err: error, ticketId: ticket.id },
      "Failed to notify student of ticket reply",
    );
  }
}

function mapListItem(row: {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    ticketNumber: row.ticketNumber,
    subject: row.subject,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function assertEnrolled(studentId: string, collegeId: string) {
  const hasEnrollment = await EnrollmentService.hasEnrollmentAtCollege(
    studentId,
    collegeId,
  );
  if (!hasEnrollment) {
    throw new ForbiddenError("You are not enrolled at this college");
  }
}

export class TicketService {
  static async create(studentId: string, data: CreateTicketInput) {
    await assertEnrolled(studentId, data.college_id);

    const ticket = await prisma.$transaction(async (tx) => {
      const created = await TicketRepository.create(tx, {
        studentId,
        collegeId: data.college_id,
        subject: data.subject,
        description: data.description,
        attachments: data.attachments ?? [],
      });
      const finalized = await TicketRepository.setTicketNumber(
        tx,
        created.id,
        created.id,
      );
      await TicketRepository.createMessage(tx, {
        ticketId: finalized.id,
        senderType: "student",
        senderId: studentId,
        message: data.description,
        attachments: data.attachments ?? [],
      });
      return finalized;
    });

    return TicketDetailQuery.getForStudent(studentId, ticket.id);
  }

  static async listMine(
    studentId: string,
    filters: { status?: string; search?: string },
    pagination: { page: number; limit: number },
  ) {
    const { rows, total } = await TicketRepository.listForStudent(
      studentId,
      filters,
      pagination,
    );
    return {
      tickets: rows.map(mapListItem),
      meta: PaginationHelper.createMeta(
        total,
        pagination.page,
        pagination.limit,
      ),
    };
  }

  static async getMine(studentId: string, ticketId: string) {
    return TicketDetailQuery.getForStudent(studentId, ticketId);
  }

  static async addMyMessage(
    studentId: string,
    ticketId: string,
    data: SendTicketMessageInput,
  ) {
    const ticket = await TicketRepository.findByIdForStudent(
      ticketId,
      studentId,
    );
    if (!ticket) throw new NotFoundError("Query not found");
    if (ticket.status === "closed") {
      throw new ConflictError(
        "This query is closed. Please submit a new query.",
      );
    }

    await TicketRepository.createMessage(prisma, {
      ticketId,
      senderType: "student",
      senderId: studentId,
      message: data.message ?? "",
      attachments: data.attachments ?? [],
    });

    // Student replied — the ball is back in the admin's court. Only flip
    // out of "in_progress" (admin already responded); "awaiting_response"
    // stays as-is (already waiting on admin), and "resolved" is left alone
    // since reopening it is a deliberate admin-only action, not automatic.
    if (ticket.status === "in_progress") {
      await TicketRepository.updateStatus(ticketId, {
        status: "awaiting_response",
      });
    }

    return TicketDetailQuery.getForStudent(studentId, ticketId);
  }

  static async listForCollege(
    collegeId: string,
    filters: { status?: string; search?: string },
    pagination: { page: number; limit: number },
  ) {
    const { rows, total } = await TicketRepository.listForCollege(
      collegeId,
      filters,
      pagination,
    );
    return {
      tickets: rows.map((r) => ({
        ...mapListItem(r),
        studentName: r.student.fullName,
        studentEmail: r.student.email,
      })),
      meta: PaginationHelper.createMeta(
        total,
        pagination.page,
        pagination.limit,
      ),
    };
  }

  static async getForCollege(collegeId: string, ticketId: string) {
    return TicketDetailQuery.getForCollege(collegeId, ticketId);
  }

  static async addAdminMessage(
    staffId: string,
    collegeId: string,
    ticketId: string,
    data: SendTicketMessageInput,
  ) {
    const ticket = await TicketRepository.findByIdForCollege(
      ticketId,
      collegeId,
    );
    if (!ticket) throw new NotFoundError("Query not found");
    if (ticket.status === "closed") {
      throw new ConflictError("Reopen this query before replying");
    }

    await TicketRepository.createMessage(prisma, {
      ticketId,
      senderType: "staff",
      senderId: staffId,
      message: data.message ?? "",
      attachments: data.attachments ?? [],
    });
    await TicketRepository.updateStatus(ticketId, {
      status: "in_progress",
    });
    await notifyStudentOfAdminReply(ticket);

    return TicketDetailQuery.getForCollege(collegeId, ticketId);
  }

  static async updateStatus(
    collegeId: string,
    ticketId: string,
    data: UpdateTicketStatusInput,
  ) {
    const ticket = await TicketRepository.findByIdForCollege(
      ticketId,
      collegeId,
    );
    if (!ticket) throw new NotFoundError("Query not found");

    const extra: { resolvedAt?: Date | null; closedAt?: Date | null } = {};
    if (data.status === "resolved") extra.resolvedAt = new Date();
    if (data.status === "closed") extra.closedAt = new Date();
    if (data.status === "reopened") {
      extra.resolvedAt = null;
      extra.closedAt = null;
    }

    await TicketRepository.updateStatus(ticketId, {
      status: data.status,
      ...extra,
    });
    return TicketDetailQuery.getForCollege(collegeId, ticketId);
  }
}
