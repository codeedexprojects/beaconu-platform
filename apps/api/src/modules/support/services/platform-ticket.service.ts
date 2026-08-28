import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { logger } from "@/shared/lib/logger";
import { PushService } from "@/modules/notifications/services/push.service";
import { PlatformTicketRepository } from "../repositories/platform-ticket.repository";
import { PlatformTicketDetailQuery } from "../queries/platform-ticket-detail.query";
import type {
  CreatePlatformTicketInput,
  SendPlatformTicketMessageInput,
  UpdatePlatformTicketStatusInput,
} from "@beaconu/types";

async function notifyCollegeOfAdminReply(ticket: {
  id: string;
  raisedBy: string;
  subject: string;
  ticketNumber: string;
}): Promise<void> {
  try {
    await PushService.sendToUser(ticket.raisedBy, "staff_member", {
      title: "New reply from BeaconU Support",
      body: `Platform support replied to "${ticket.subject}" (#${ticket.ticketNumber.slice(-6).toUpperCase()})`,
      data: { type: "platform_ticket_admin_reply", ticketId: ticket.id },
    });
  } catch (error) {
    logger.error(
      { err: error, ticketId: ticket.id },
      "Failed to notify college of platform ticket reply",
    );
  }
}

const DEFAULT_MESSAGE_PAGE_LIMIT = 20;

function mapListItem(row: {
  id: string;
  ticketNumber: string;
  type: string;
  subject: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    ticketNumber: row.ticketNumber,
    type: row.type,
    subject: row.subject,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class PlatformTicketService {
  static async create(
    collegeId: string,
    staffId: string,
    data: CreatePlatformTicketInput,
  ) {
    let phoneNumber = data.phone_number ?? null;
    if (data.type === "call_request" && !phoneNumber) {
      const staff = await PlatformTicketRepository.findStaffPhone(staffId);
      phoneNumber = staff?.phoneNumber ?? null;
    }
    if (data.type === "call_request" && !phoneNumber) {
      throw new ValidationError(
        "A phone number is required for a call request",
      );
    }

    const ticket = await prisma.$transaction(async (tx) => {
      const created = await PlatformTicketRepository.create(tx, {
        collegeId,
        raisedBy: staffId,
        type: data.type,
        subject: data.subject,
        description: data.description,
        phoneNumber,
        preferredTime: data.preferred_time ?? null,
        attachments: data.attachments ?? [],
      });
      const finalized = await PlatformTicketRepository.setTicketNumber(
        tx,
        created.id,
        created.id,
      );
      await PlatformTicketRepository.createMessage(tx, {
        ticketId: finalized.id,
        senderType: "college",
        senderId: staffId,
        message: data.description,
        attachments: data.attachments ?? [],
      });
      return finalized;
    });

    return PlatformTicketDetailQuery.getForCollege(collegeId, ticket.id, {
      limit: DEFAULT_MESSAGE_PAGE_LIMIT,
    });
  }

  static async listForCollege(
    collegeId: string,
    filters: { status?: string; type?: string; search?: string },
    pagination: { page: number; limit: number },
  ) {
    const { rows, total } = await PlatformTicketRepository.listForCollege(
      collegeId,
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

  static async getForCollege(
    collegeId: string,
    ticketId: string,
    messagePagination: { page?: number; limit: number },
  ) {
    return PlatformTicketDetailQuery.getForCollege(
      collegeId,
      ticketId,
      messagePagination,
    );
  }

  static async addCollegeMessage(
    collegeId: string,
    staffId: string,
    ticketId: string,
    data: SendPlatformTicketMessageInput,
  ) {
    const ticket = await PlatformTicketRepository.findByIdForCollege(
      ticketId,
      collegeId,
    );
    if (!ticket) throw new NotFoundError("Query not found");
    if (ticket.status === "closed") {
      throw new ConflictError(
        "This query is closed. Please submit a new query.",
      );
    }

    await PlatformTicketRepository.createMessage(prisma, {
      ticketId,
      senderType: "college",
      senderId: staffId,
      message: data.message ?? "",
      attachments: data.attachments ?? [],
    });

    // Same convention as the student support ticket system: only flip out
    // of "in_progress" (admin already responded); "awaiting_response" stays
    // as-is, "resolved" is left for the admin to deliberately reopen.
    if (ticket.status === "in_progress") {
      await PlatformTicketRepository.updateStatus(ticketId, {
        status: "awaiting_response",
      });
    }

    return PlatformTicketDetailQuery.getForCollege(collegeId, ticketId, {
      limit: DEFAULT_MESSAGE_PAGE_LIMIT,
    });
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
    const { rows, total } = await PlatformTicketRepository.listForPlatform(
      filters,
      pagination,
    );
    return {
      tickets: rows.map((r) => ({
        ...mapListItem(r),
        collegeId: r.collegeId,
        collegeName: r.college.name,
        raisedByName: r.raiser.fullName,
      })),
      meta: PaginationHelper.createMeta(
        total,
        pagination.page,
        pagination.limit,
      ),
    };
  }

  static async getForPlatform(
    ticketId: string,
    messagePagination: { page?: number; limit: number },
  ) {
    return PlatformTicketDetailQuery.getForPlatform(
      ticketId,
      messagePagination,
    );
  }

  static async addAdminMessage(
    adminId: string,
    ticketId: string,
    data: SendPlatformTicketMessageInput,
  ) {
    const ticket = await PlatformTicketRepository.findById(ticketId);
    if (!ticket) throw new NotFoundError("Query not found");
    if (ticket.status === "closed") {
      throw new ConflictError("Reopen this query before replying");
    }

    await PlatformTicketRepository.createMessage(prisma, {
      ticketId,
      senderType: "platform_admin",
      senderId: adminId,
      message: data.message ?? "",
      attachments: data.attachments ?? [],
    });
    await PlatformTicketRepository.updateStatus(ticketId, {
      status: "in_progress",
      assignedTo: adminId,
    });
    await notifyCollegeOfAdminReply(ticket);

    return PlatformTicketDetailQuery.getForPlatform(ticketId, {
      limit: DEFAULT_MESSAGE_PAGE_LIMIT,
    });
  }

  static async updateStatus(
    ticketId: string,
    data: UpdatePlatformTicketStatusInput,
  ) {
    const ticket = await PlatformTicketRepository.findById(ticketId);
    if (!ticket) throw new NotFoundError("Query not found");

    const extra: { resolvedAt?: Date | null; closedAt?: Date | null } = {};
    if (data.status === "resolved") extra.resolvedAt = new Date();
    if (data.status === "closed") extra.closedAt = new Date();
    if (data.status === "reopened") {
      extra.resolvedAt = null;
      extra.closedAt = null;
    }

    await PlatformTicketRepository.updateStatus(ticketId, {
      status: data.status,
      ...extra,
    });
    return PlatformTicketDetailQuery.getForPlatform(ticketId, {
      limit: DEFAULT_MESSAGE_PAGE_LIMIT,
    });
  }
}
