export type TicketStatus =
  | "in_progress"
  | "awaiting_response"
  | "resolved"
  | "closed"
  | "reopened";

export interface TicketAttachmentItem {
  url: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
}

export interface TicketListItem {
  id: string;
  ticketNumber: string;
  subject: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TicketAdminListItem extends TicketListItem {
  studentName: string;
  studentEmail: string | null;
}

export interface TicketMessageItem {
  id: string;
  senderType: "student" | "staff";
  senderName: string;
  message: string;
  attachments: TicketAttachmentItem[];
  isSystem: boolean;
  createdAt: string;
}

export interface TicketDetail {
  id: string;
  ticketNumber: string;
  subject: string;
  status: TicketStatus;
  collegeId: string;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessageItem[];
}

export interface TicketListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TicketListResponse {
  tickets: TicketListItem[];
  meta: TicketListMeta;
}

export interface TicketAdminListResponse {
  tickets: TicketAdminListItem[];
  meta: TicketListMeta;
}

export interface CreateTicketInput {
  college_id: string;
  subject: string;
  description: string;
  attachments?: TicketAttachmentItem[];
}

export interface SendTicketMessageInput {
  message?: string;
  attachments?: TicketAttachmentItem[];
}

export interface UpdateTicketStatusInput {
  status: TicketStatus;
}
