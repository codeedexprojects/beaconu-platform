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

export interface CollegeStudentListItem {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
}

export interface CollegeStudentListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CollegeStudentListResponse {
  students: CollegeStudentListItem[];
  meta: CollegeStudentListMeta;
}

// ── College-Admin: Enrolled Students list + full detail ────────────────────

export interface EnrolledStudentListItem {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  enrollmentId: string;
  enrollmentNumber: string | null;
  courseId: string;
  courseName: string;
  courseCode: string;
  academicYear: string;
  enrollmentStatus: string;
  enrolledAt: string;
}

export interface EnrolledStudentListResponse {
  students: EnrolledStudentListItem[];
  meta: CollegeStudentListMeta;
}

export interface StudentDetailEnrollment {
  id: string;
  enrollmentNumber: string | null;
  academicYear: string;
  status: string;
  enrolledAt: string;
  completedAt: string | null;
  courseId: string;
  courseName: string;
  courseCode: string;
  courseDuration: string | null;
}

export interface StudentDetailHostel {
  id: string;
  status: string;
  roomPlanType: string;
  dietaryPreference: string | null;
  selectedAddons: { addon_service_id: string; plan_label: string }[];
  feeBreakdown: Record<string, unknown>;
  enrolledFrom: string;
  enrolledUntil: string | null;
  hostel: { id: string; name: string; hostelType: string };
  roomType: {
    id: string;
    name: string;
    annualPlanPrice: string | null;
    monthlyPlanPrice: string | null;
    admissionFee: string;
    securityDeposit: string;
  };
  messPlan: { id: string; name: string; priceMonthly: string } | null;
}

export interface StudentDetailCommute {
  id: string;
  status: string;
  enrolledFrom: string;
  enrolledUntil: string | null;
  route: { id: string; name: string };
  bus: {
    id: string;
    busNumber: string;
    busName: string | null;
    driverName: string | null;
    driverPhone: string | null;
    driverStatus: string;
    monthlyFee: string;
  };
  pickupStop: {
    id: string;
    stopName: string;
    morningTime: string | null;
    eveningTime: string | null;
  };
}

export interface StudentDetailTransaction {
  id: string;
  transactionNumber: string;
  amount: string;
  status: string;
  paymentMethod: string;
  paidAt: string | null;
  createdAt: string;
}

export interface StudentDetailLedgerEntry {
  id: string;
  feeCategory: string;
  description: string | null;
  amount: string;
  paidAmount: string;
  balanceAmount: string;
  status: string;
  dueDate: string | null;
  createdAt: string;
  transactions: StudentDetailTransaction[];
}

export interface StudentDetailPayments {
  courseFees: StudentDetailLedgerEntry[];
  hostelFees: StudentDetailLedgerEntry[];
  commuteFees: StudentDetailLedgerEntry[];
  totalPaid: string;
  totalDue: string;
}

export interface StudentDetailDocumentRequest {
  id: string;
  documentCategory: string;
  documentName: string;
  status: string;
  deadline: string;
  fileUrl: string | null;
  submittedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface StudentDetailSupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDetailBeaconuCard {
  id: string;
  cardNumber: string;
  cardHolderName: string;
  validUntil: string;
  balance: string;
  totalEarned: string;
  totalWithdrawn: string;
  status: string;
}

export interface StudentDetailDto {
  id: string;
  fullName: string;
  email: string | null;
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  status: string;
  profileMetadata: StudentProfileMetadata;
  lastLoginAt: string | null;
  createdAt: string;
  enrollment: StudentDetailEnrollment;
  hostel: StudentDetailHostel | null;
  commute: StudentDetailCommute | null;
  payments: StudentDetailPayments;
  documentRequests: StudentDetailDocumentRequest[];
  supportTickets: StudentDetailSupportTicket[];
  beaconuCard: StudentDetailBeaconuCard | null;
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
