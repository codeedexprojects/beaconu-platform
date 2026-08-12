export type SeatCancellationStatus = "pending" | "approved" | "rejected";

export type RefundStatus =
  | "not_applicable"
  | "pending"
  | "processed"
  | "denied";

export interface SeatCancellationRequest {
  id: string;
  applicationCourseId: string;
  studentId: string;
  studentName: string | null;
  studentEmail: string | null;
  courseName: string;
  courseCode: string;
  collegeId: string;
  reason: string;
  supportingDocUrls: string[];
  status: SeatCancellationStatus;
  refundAmount: string | null;
  refundStatus: RefundStatus | null;
  processedBy: string | null;
  remarks: string | null;
  requestedAt: string;
  processedAt: string | null;
}

export interface RequestSeatCancellationInput {
  application_course_id: string;
  reason: string;
  supporting_doc_urls?: string[];
}

export interface ReviewSeatCancellationInput {
  decision: "approve" | "reject";
  remarks?: string;
  refund_amount?: number;
  refund_status?: RefundStatus;
}

export interface SeatCancellationListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SeatCancellationListResponse {
  requests: SeatCancellationRequest[];
  meta: SeatCancellationListMeta;
}
