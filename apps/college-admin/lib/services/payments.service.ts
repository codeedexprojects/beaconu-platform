import { api, type OffsetPaginationMeta } from "@/lib/api";
import { API_BASE_URL, COLLEGE_ADMIN_TOKEN_KEY } from "@/lib/constants";

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

export interface FinanceOverview {
  totalRevenue: string;
  categories: {
    tuitionFees: string;
    commuteBooking: string;
    studentHousingBooking: string;
    applicationFees: string;
  };
  paymentMethodBreakdown: {
    method: string;
    label: string;
    amount: string;
    percentage: number;
  }[];
  overdueBalance: string;
  collectionVsTargetPercent: number;
}

export interface FinanceTransaction {
  id: string;
  transactionNumber: string;
  time: string;
  studentId: string;
  studentName: string;
  feeCategory: string | null;
  paymentMethod: string;
  paymentMethodLabel: string;
  amount: string;
  direction: "credit" | "debit";
  status: string;
}

export interface FinanceFilters {
  from_date?: string;
  to_date?: string;
  course_id?: string;
  fee_category?: string;
  payment_method?: string;
}

export interface FinanceTransactionsFilters extends FinanceFilters {
  page?: number;
  limit?: number;
}

const FINANCE_BASE = `${BASE}/finance`;

function financeQueryString(filters: FinanceFilters): string {
  const params = new URLSearchParams();
  if (filters.from_date) params.set("from_date", filters.from_date);
  if (filters.to_date) params.set("to_date", filters.to_date);
  if (filters.course_id) params.set("course_id", filters.course_id);
  if (filters.fee_category) params.set("fee_category", filters.fee_category);
  if (filters.payment_method)
    params.set("payment_method", filters.payment_method);
  return params.toString();
}

export function getFinanceOverview(
  filters: FinanceFilters = {},
): Promise<FinanceOverview> {
  return api.get(`${FINANCE_BASE}/overview?${financeQueryString(filters)}`);
}

export function getFinanceTransactions(
  filters: FinanceTransactionsFilters = {},
): Promise<{ data: FinanceTransaction[]; meta: OffsetPaginationMeta }> {
  const params = new URLSearchParams(financeQueryString(filters));
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 20));
  return api.getPaginated<FinanceTransaction[]>(
    `${FINANCE_BASE}/transactions?${params.toString()}`,
  );
}

/** Downloads the CSV export directly in the browser (auth header attached
 * manually since this isn't a JSON response the shared api client can parse). */
export async function downloadFinanceTransactionsCsv(
  filters: FinanceFilters = {},
): Promise<void> {
  const token = localStorage.getItem(COLLEGE_ADMIN_TOKEN_KEY);
  const res = await fetch(
    `${API_BASE_URL}${FINANCE_BASE}/transactions/export?${financeQueryString(filters)}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );
  if (!res.ok) {
    throw new Error("Failed to export transactions");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
