// ─── Counsellor Registration Request DTOs ────────────────────

export type CounsellorType = "academic" | "mindcare";

export type CounsellorRequestStatus = "pending" | "approved" | "rejected";

export interface SubmitCounsellorRequestInput {
  full_name: string;
  email: string;
  phone_number?: string;
  counsellor_type: CounsellorType;
  qualification?: string;
  years_of_experience?: string;
  message?: string;
}

export interface CounsellorRegistrationRequest {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  counsellor_type: CounsellorType;
  qualification: string | null;
  years_of_experience: string | null;
  message: string | null;
  status: CounsellorRequestStatus;
  review_remarks: string | null;
  reviewer: { id: string; name: string } | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateCounsellorRequestStatusInput {
  status: Extract<CounsellorRequestStatus, "approved" | "rejected">;
  review_remarks?: string;
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
