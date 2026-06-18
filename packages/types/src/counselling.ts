// ─── Counsellor Registration Request DTOs ────────────────────

export type CounsellorType = "academic" | "mindcare";

export type CounsellorRequestStatus = "pending" | "approved" | "rejected";

export interface SubmitCounsellorRequestInput {
  full_name: string;
  email: string;
  phone_number: string;
  gender: "male" | "female" | "non_binary" | "prefer_not_to_say";
  city: string;
  counsellor_type: CounsellorType;
  qualification: string;
  years_of_experience: string;
  known_languages: string;
  specialization: string;
  license_number?: string;
  message: string;
  password: string;
  confirm_password: string;
}

export interface CounsellorRegistrationRequest {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  gender: string | null;
  city: string | null;
  counsellor_type: CounsellorType;
  qualification: string | null;
  years_of_experience: string | null;
  known_languages: string | null;
  specialization: string | null;
  license_number: string | null;
  message: string | null;
  status: CounsellorRequestStatus;
  review_remarks: string | null;
  counsellor_code: string | null;
  reviewer: { id: string; name: string } | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateCounsellorRequestStatusInput {
  status: Extract<CounsellorRequestStatus, "approved" | "rejected">;
  review_remarks?: string;
}

export interface UpdateCounsellorRequestStatusResult {
  id: string;
  status: CounsellorRequestStatus;
  review_remarks: string | null;
  updated_at: string;
  counsellor_code: string | null;
}

// ─── Counselling Session DTOs ───────────────────────────────

export type CounsellingSessionStatus = "booked" | "completed" | "cancelled";

export interface ListCounsellingSessionsQuery {
  page?: number;
  limit?: number;
  date?: string;
  status?: CounsellingSessionStatus;
  search?: string;
}

// ─── Counsellor (Admin) DTOs ────────────────────────────────

export type CounsellorStatus = "active" | "inactive" | "pending_verification";

export interface Counsellor {
  id: string;
  counsellor_code: string | null;
  full_name: string;
  email: string;
  phone_number: string;
  avatar_url: string | null;
  counsellor_type: CounsellorType;
  status: CounsellorStatus;
  rating: number;
  known_languages: string | null;
  session_fee: number;
  profile_metadata: unknown;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListCounsellorsFilters {
  counsellor_type?: CounsellorType;
  status?: CounsellorStatus;
  language?: string;
}

export interface CounsellorSlot {
  id: string;
  available_date: string;
  start_time: string;
  end_time: string;
  session_duration_mins: number;
  is_booked: boolean;
  session_fee: number;
}

export interface CounsellorWalletTransaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  session_id: string | null;
  withdrawal_status: string | null;
  balance_after: number;
  created_at: string;
}

export interface CounsellorWallet {
  id: string;
  counsellor_id: string;
  balance: number;
  total_earned: number;
  total_withdrawn: number;
  created_at: string;
  updated_at: string;
  transactions: CounsellorWalletTransaction[];
}

export interface CounsellorWithdrawalRequest {
  id: string;
  counsellor: {
    id: string;
    full_name: string;
    email: string;
    counsellor_code: string | null;
  };
  amount: number;
  withdrawal_status: string | null;
  bank_details: {
    account_holder_name: string;
    account_number: string;
    ifsc: string;
    bank_name: string;
  };
  review_remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateWithdrawalStatusInput {
  status: "approved" | "rejected";
  remarks?: string;
}

export interface CounsellorRecentSession {
  id: string;
  status: CounsellingSessionStatus;
  session_mode: string;
  session_type: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  session_fee: number | null;
  payment_status: string;
  transaction_id: string | null;
  student: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    email: string;
  };
}

export interface CounsellorDetail {
  counsellor: Counsellor;
  stats: {
    slots: { total: number; available: number; booked: number };
    sessions: {
      total: number;
      booked: number;
      completed: number;
      cancelled: number;
    };
    payments: { paid_sessions_count: number; total_payment_received: number };
  };
  wallet: CounsellorWallet | null;
  slots: { available: CounsellorSlot[]; booked: CounsellorSlot[] };
  recent_sessions: CounsellorRecentSession[];
}
