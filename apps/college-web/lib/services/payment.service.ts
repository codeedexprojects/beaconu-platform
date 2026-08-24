import { api } from "@/lib/api";
import type {
  ApplicationPaymentDto,
  ConfirmPaymentInput,
} from "@beaconu/types";

export type OfflineTokenPaymentMethod = "demand_draft" | "bank_transfer";

export interface OfflineTokenPaymentInput {
  payment_method: OfflineTokenPaymentMethod;
  amount: number;
  proof_url: string;
  proof_file_name?: string | null;
  dd_number: string | null;
  dd_bank_name: string | null;
  dd_date: string | null;
  bank_ref_number: string | null;
  note?: string | null;
}

export interface OfflineTokenPaymentStatus {
  id: string;
  transactionNumber: string;
  amount: string;
  currency: string;
  status: string;
  paymentMethod: OfflineTokenPaymentMethod;
  proofUrl: string;
  proofFileName: string | null;
  ddNumber: string | null;
  ddBankName: string | null;
  ddDate: string | null;
  bankRefNumber: string | null;
  studentNote: string | null;
  verificationStatus: "pending_verification" | "verified" | "rejected";
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  isResubmission: boolean;
  paidAt: string | null;
  createdAt: string;
}

export async function initiateTokenPayment(
  applicationCourseId: string,
): Promise<ApplicationPaymentDto> {
  return api.post(
    `/api/v1/student/payments/courses/${applicationCourseId}/token/initiate`,
    undefined,
  );
}

export async function confirmTokenPayment(
  applicationCourseId: string,
  input: ConfirmPaymentInput,
): Promise<ApplicationPaymentDto> {
  return api.post(
    `/api/v1/student/payments/courses/${applicationCourseId}/token/confirm`,
    input,
  );
}

export async function submitOfflineTokenPayment(
  applicationCourseId: string,
  input: OfflineTokenPaymentInput,
): Promise<OfflineTokenPaymentStatus> {
  return api.post(
    `/api/v1/student/payments/courses/${applicationCourseId}/token/offline/submit`,
    input,
  );
}

export async function getOfflineTokenPaymentStatus(
  applicationCourseId: string,
): Promise<OfflineTokenPaymentStatus | null> {
  return api.get(
    `/api/v1/student/payments/courses/${applicationCourseId}/token/offline/status`,
  );
}

export async function resubmitOfflineTokenPayment(
  applicationCourseId: string,
  input: OfflineTokenPaymentInput,
): Promise<OfflineTokenPaymentStatus> {
  return api.post(
    `/api/v1/student/payments/courses/${applicationCourseId}/token/offline/resubmit`,
    input,
  );
}
