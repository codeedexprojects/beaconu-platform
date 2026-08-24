export type PlatformTicketType = "query" | "call_request";

export type PlatformTicketStatus =
  | "in_progress"
  | "awaiting_response"
  | "resolved"
  | "closed"
  | "reopened";

export interface PlatformTicketAttachmentItem {
  url: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
}

export interface PlatformTicketListItem {
  id: string;
  ticketNumber: string;
  type: PlatformTicketType;
  subject: string;
  status: PlatformTicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformTicketAdminListItem extends PlatformTicketListItem {
  collegeId: string;
  collegeName: string;
  raisedByName: string;
}

export interface PlatformTicketMessageItem {
  id: string;
  senderType: "college" | "platform_admin";
  senderName: string;
  message: string;
  attachments: PlatformTicketAttachmentItem[];
  isSystem: boolean;
  createdAt: string;
}

export interface PlatformTicketDetail {
  id: string;
  ticketNumber: string;
  type: PlatformTicketType;
  subject: string;
  status: PlatformTicketStatus;
  collegeId: string;
  phoneNumber: string | null;
  preferredTime: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  messages: PlatformTicketMessageItem[];
  messagesMeta: PlatformTicketListMeta;
}

export interface PlatformTicketListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PlatformTicketListResponse {
  tickets: PlatformTicketListItem[];
  meta: PlatformTicketListMeta;
}

export interface PlatformTicketAdminListResponse {
  tickets: PlatformTicketAdminListItem[];
  meta: PlatformTicketListMeta;
}

export interface CreatePlatformTicketInput {
  type: PlatformTicketType;
  subject: string;
  description: string;
  phone_number?: string;
  preferred_time?: string;
  attachments?: PlatformTicketAttachmentItem[];
}

export interface SendPlatformTicketMessageInput {
  message?: string;
  attachments?: PlatformTicketAttachmentItem[];
}

export interface UpdatePlatformTicketStatusInput {
  status: PlatformTicketStatus;
}
