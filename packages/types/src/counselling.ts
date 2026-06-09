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
