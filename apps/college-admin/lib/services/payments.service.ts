import { api, type OffsetPaginationMeta } from "@/lib/api";

export interface OfflineTokenPaymentDto {
  id: string;
  transactionNumber: string;
  amount: string;
  currency: string;
  status: string;
  paymentMethod: string;
  proofUrl: string | null;
  proofFileName: string | null;
  ddNumber: string | null;
  ddBankName: string | null;
  ddDate: string | null;
  bankRefNumber: string | null;
  studentNote: string | null;
  verificationStatus: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  isResubmission: boolean;
  paidAt: string | null;
  createdAt: string;
  applicationCourseId: string | null;
  courseName: string | null;
  studentName: string | null;
  studentEmail: string | null;
}

export interface ReviewOfflineTokenPaymentInput {
  decision: "verified" | "rejected";
  note?: string;
  received_amount?: number;
}

export interface OfflineReviewQueueFilters {
  status?: "pending_verification" | "verified" | "rejected";
  page?: number;
  limit?: number;
}

const BASE = "/api/v1/college-admin/payments";

export function getOfflineReviewQueue(
  filters: OfflineReviewQueueFilters = {},
): Promise<{ data: OfflineTokenPaymentDto[]; meta: OffsetPaginationMeta }> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 20));
  return api.getPaginated<OfflineTokenPaymentDto[]>(
    `${BASE}/offline-review-queue?${params.toString()}`,
  );
}

export function reviewOfflineTokenPayment(
  transactionId: string,
  data: ReviewOfflineTokenPaymentInput,
): Promise<OfflineTokenPaymentDto & { finalized: boolean }> {
  return api.patch(`${BASE}/offline/${transactionId}/review`, data);
}
