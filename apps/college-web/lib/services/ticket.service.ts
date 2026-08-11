import { api } from "@/lib/api";
import type {
  CreateTicketInput,
  SendTicketMessageInput,
  TicketDetail,
  TicketListResponse,
  TicketStatus,
} from "@beaconu/types";

interface UploadPresignResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

interface UploadVerifyResponse {
  verified: boolean;
  permanentUrl: string;
  viewUrl: string;
}

export async function uploadTicketAttachment(file: File): Promise<{
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}> {
  if (!file.type) {
    throw new Error("Selected file has no MIME type");
  }

  const presigned = await api.post<UploadPresignResponse>(
    "/api/v1/student/uploads/ticket-attachment/presign",
    { mimeType: file.type, fileSizeBytes: file.size },
  );

  const uploadResponse = await fetch(presigned.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadResponse.ok) {
    throw new Error(
      `Failed to upload file to storage (HTTP ${uploadResponse.status})`,
    );
  }

  const verified = await api.post<UploadVerifyResponse>(
    "/api/v1/student/uploads/ticket-attachment/verify",
    { key: presigned.key },
  );

  return {
    url: verified.permanentUrl,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  };
}

export async function listMyTickets(params?: {
  status?: TicketStatus;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<TicketListResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString() ? `?${query.toString()}` : "";
  return api.get(`/api/v1/student/support${qs}`);
}

export async function createTicket(
  input: CreateTicketInput,
): Promise<TicketDetail> {
  return api.post("/api/v1/student/support", input);
}

export async function getTicketDetail(ticketId: string): Promise<TicketDetail> {
  return api.get(`/api/v1/student/support/${ticketId}`);
}

export async function sendTicketMessage(
  ticketId: string,
  input: SendTicketMessageInput,
): Promise<TicketDetail> {
  return api.post(`/api/v1/student/support/${ticketId}/messages`, input);
}
