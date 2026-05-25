export interface StudentProfileMetadata {
  dateOfBirth?: string | null;
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
  city?: string | null;
  state?: string | null;
  nationality?: string | null;
  category?: "general" | "obc" | "sc" | "st" | "ews" | "other" | null;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  phoneCountryCode: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  source: string;
  status: string;
  profileMetadata: StudentProfileMetadata;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStudentProfileInput {
  full_name?: string;
  email?: string | null;
  avatar_url?: string | null;
  date_of_birth?: string | null;
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
  city?: string | null;
  state?: string | null;
  nationality?: string | null;
  category?: "general" | "obc" | "sc" | "st" | "ews" | "other" | null;
}
