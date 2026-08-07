export interface StudentProfileMetadata {
  dateOfBirth?: string | null;
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
  city?: string | null;
  state?: string | null;
  nationality?: string | null;
  category?: "general" | "obc" | "sc" | "st" | "ews" | "other" | null;
}

export interface StudentCollegeReview {
  id: string;
  collegeId: string;
  rating: number;
  reviewText: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentHostelReview {
  id: string;
  hostelId: string;
  rating: number;
  reviewText: string | null;
  isVerified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentCounsellingReview {
  sessionId: string;
  counsellorId: string;
  rating: number;
  ratingFeedback: string | null;
  scheduledDate: string;
  status: string;
  updatedAt: string;
}

export interface StudentReviews {
  collegeReviews: StudentCollegeReview[];
  hostelReviews: StudentHostelReview[];
  counsellingReviews: StudentCounsellingReview[];
}

export interface StudentEnrolledCollege {
  collegeId: string;
  name: string;
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
  enrolledCollege: StudentEnrolledCollege | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  reviews: StudentReviews;
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

export type StudentAccountStatus = "active" | "suspended" | "inactive";

export interface AdminStudentListItem {
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
  lastLoginAt: string | null;
  createdAt: string;
}

export interface ListStudentsQuery {
  search?: string;
  status?: StudentAccountStatus;
  source?: string;
  page?: number;
  limit?: number;
}

export interface UpdateStudentStatusInput {
  status: StudentAccountStatus;
}
