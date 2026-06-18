import type { PaginationMeta } from "./api";

export interface AssociateDashboardSummary {
  applicationSubmitted: number;
  admissionConfirmed: number;
  applicationRejected: number;
  droppedOut: number;
}

export interface ServiceChargeItem {
  id: string;
  college: { id: string; name: string };
  course: { id: string; name: string } | null;
  academicYear: string;
  studentCategory: string;
  grossAmount: number;
  gstPercentage: number;
  gstAmount: number;
  netPayout: number;
  termsAndConditions: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceChargeUpdateInput {
  grossAmount?: number;
  gstPercentage?: number;
  termsAndConditions?: string;
  isActive?: boolean;
}

export interface ReferralStudentSnippet {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
}

export interface ReferralCommissionSnippet {
  id: string;
  netPayout: number;
  status: string;
}

export interface ReferralListItem {
  id: string;
  student: ReferralStudentSnippet;
  employee: {
    id: string;
    fullName: string;
    email: string;
  };
  college: {
    id: string;
    name: string;
  };
  course: {
    id: string;
    name: string;
  } | null;
  status: string;
  commission: ReferralCommissionSnippet | null;
  createdAt: string;
  statusUpdatedAt: string | null;
}

export interface ReferralListResponse {
  referrals: ReferralListItem[];
  meta: PaginationMeta;
}

export interface BlinkBankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
}

export interface BlinkWalletBalance {
  id: string | null;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  bankDetails: BlinkBankDetails | null;
  updatedAt: string | null;
}

export interface BlinkWalletTransactionItem {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  withdrawalStatus: string | null;
  balanceAfter: number;
  createdAt: string;
}

export interface EmployeeWithRanking {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  status: string;
  roleSlug: string;
  createdAt: string;
  rank: number;
  totalReferrals: number;
  confirmedCount: number;
  commissionEarned: number;
}

export interface EmployeeListItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  status: string;
  roleSlug: string;
  createdAt: string;
}

export interface EmployeePerformance {
  id: string;
  fullName: string;
  email: string;
  status: string;
  roleSlug: string;
  referrals: {
    total: number;
    byStatus: {
      registered: number;
      confirmed: number;
      rejected: number;
      dropped_out: number;
    };
    conversionRate: number;
  };
  commission: {
    earned: number;
    pending: number;
  };
}

export interface BlinkWithdrawalResult {
  transactionId: string;
  amount: number;
  withdrawalStatus: string | null;
  balanceAfter: number;
}

export interface ReferralStudentProfile {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
  referral: {
    id: string;
    status: string;
    commission: ReferralCommissionSnippet | null;
    createdAt: string;
  };
}
