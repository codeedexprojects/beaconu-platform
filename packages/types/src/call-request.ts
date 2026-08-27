export type CallRequestStatus = "pending" | "contacted" | "cancelled";

export interface CallRequestListItem {
  id: string;
  collegeId: string;
  collegeName: string;
  phoneNumber: string;
  preferredTime: string | null;
  status: CallRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CallRequestAdminListItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  phoneNumber: string;
  preferredTime: string | null;
  status: CallRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CallRequestDetail {
  id: string;
  collegeId: string;
  collegeName: string;
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  phoneNumber: string;
  preferredTime: string | null;
  message: string | null;
  status: CallRequestStatus;
  staffNote: string | null;
  respondedByName: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CallRequestListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CallRequestListResponse {
  callRequests: CallRequestListItem[];
  meta: CallRequestListMeta;
}

export interface CallRequestAdminListResponse {
  callRequests: CallRequestAdminListItem[];
  meta: CallRequestListMeta;
}

export interface CreateCallRequestInput {
  college_id: string;
  phone_number?: string;
  preferred_time?: string;
  message?: string;
}

export interface UpdateCallRequestStatusInput {
  status: Extract<CallRequestStatus, "contacted" | "cancelled">;
  staff_note?: string;
}
