export type InterviewMode = "gmeet" | "telephonic" | "on_campus";

export type InterviewBookingStatus = "scheduled" | "completed" | "cancelled";
export type InterviewOutcome = "recommended" | "not_recommended";

export interface InterviewBookingCourseItem {
  applicationCourseId: string;
  courseName: string;
  status: string;
}

export interface InterviewBookingItem {
  id: string;
  applicationId: string;
  applicationNumber: string;
  courses: InterviewBookingCourseItem[];
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  studentPhone: string | null;
  studentPhotoUrl: string | null;
  status: InterviewBookingStatus;
  mode: InterviewMode | null;
  scheduledDate: string | null;
  startTime: string | null;
  endTime: string | null;
  panelMemberId: string | null;
  panelMemberName: string | null;
  panelMemberRole: string | null;
  meetingUrl: string | null;
  meetingId: string | null;
  venue: string | null;
  interviewScore: string | null;
  interviewRemarks: string | null;
  interviewOutcome: InterviewOutcome | null;
  evaluatedBy: string | null;
  evaluatedAt: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

/** A candidate that has reached the interview-eligible stage but has no
 * `InterviewBooking` row yet (or only a `cancelled` one) — a computed
 * view, not a stored entity. See Plan AD Design Decision #6. */
export interface PendingInterviewItem {
  applicationId: string;
  applicationNumber: string;
  courses: InterviewBookingCourseItem[];
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  studentPhone: string | null;
  studentPhotoUrl: string | null;
  eligibleSince: string;
}

/** Applicant context for the college-admin scheduling screen — always
 * available regardless of whether an `InterviewBooking` row exists yet.
 * `booking` is null for a still-pending candidate. */
export interface InterviewApplicationDetail {
  applicationId: string;
  applicationNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  studentPhone: string | null;
  studentPhotoUrl: string | null;
  courses: InterviewBookingCourseItem[];
  booking: InterviewBookingItem | null;
}

export interface ScheduleInterviewInput {
  scheduled_date: string;
  start_time: string;
  end_time: string;
  panel_member_id: string;
  mode: InterviewMode;
  venue?: string;
}

export interface CompleteInterviewInput {
  interview_score?: number;
  interview_outcome?: InterviewOutcome;
  interview_remarks?: string;
}

export interface PanelMemberAvailabilityItem {
  id: string;
  name: string;
  roleName: string | null;
  avatarUrl: string | null;
  isAvailable: boolean;
}

export interface PanelAvailabilityQuery {
  scheduled_date: string;
  start_time: string;
  end_time: string;
  search?: string;
  exclude_booking_id?: string;
}

export interface ShortlistCourseInput {
  document_url: string;
  valid_until: string;
}

export interface OfferLetterItem {
  id: string;
  applicationCourseId: string;
  studentId: string;
  collegeId: string;
  offerNumber: string;
  offerDate: string;
  validUntil: string;
  tokenAmount: string;
  tokenPaymentStatus: string;
  documentUrl: string;
  status: string;
  issuedBy: string | null;
  createdAt: string;
}
