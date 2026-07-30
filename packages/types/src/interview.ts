export type InterviewMode = "gmeet" | "telephonic" | "on_campus";
export type InterviewSlotStatus = "active" | "cancelled";

export interface InterviewSlotItem {
  id: string;
  collegeId: string;
  mode: InterviewMode;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  durationMins: number;
  maxCapacity: number;
  bookedCount: number;
  meetingUrl: string | null;
  meetingId: string | null;
  meetingPasscode: string | null;
  phoneNumber: string | null;
  venue: string | null;
  interviewerId: string | null;
  interviewerName: string | null;
  status: InterviewSlotStatus;
  createdAt: string;
}

// No manual meeting_url/meeting_id/meeting_passcode — for "gmeet" mode
// these are always auto-generated via the Google Meet integration
// (@/shared/lib/google-meet), never entered by hand. No manual
// phone_number either — for "telephonic" mode the interviewer calls the
// student's own phone number (see InterviewBookingItem.studentPhone),
// not a college-entered number.
export interface CreateInterviewSlotInput {
  mode: InterviewMode;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  duration_mins?: number;
  max_capacity?: number;
  venue?: string;
  interviewer_id?: string;
}

export type UpdateInterviewSlotInput = Partial<CreateInterviewSlotInput>;

export type InterviewBookingStatus = "booked" | "completed" | "cancelled";
export type InterviewOutcome = "recommended" | "not_recommended";

export interface InterviewBookingItem {
  id: string;
  applicationCourseId: string;
  studentId: string;
  studentName: string;
  /** The student's own phone number — for "telephonic" slots, this is
   * what the interviewer calls, not a college-entered number. */
  studentPhone: string | null;
  slot: InterviewSlotItem;
  status: InterviewBookingStatus;
  interviewScore: string | null;
  interviewRemarks: string | null;
  interviewOutcome: InterviewOutcome | null;
  evaluatedBy: string | null;
  evaluatedAt: string | null;
  bookedAt: string;
  completedAt: string | null;
}

export interface BookInterviewSlotInput {
  application_course_id: string;
  slot_id: string;
}

export interface CompleteInterviewInput {
  interview_score?: number;
  interview_outcome?: InterviewOutcome;
  interview_remarks?: string;
}

export type InterviewRescheduleStatus = "pending" | "approved" | "rejected";

export interface InterviewRescheduleItem {
  id: string;
  bookingId: string;
  studentId: string;
  fromSlotId: string;
  toSlotId: string | null;
  reason: string;
  status: InterviewRescheduleStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewRemarks: string | null;
  createdAt: string;
}

export interface RequestInterviewRescheduleInput {
  to_slot_id?: string;
  reason: string;
}

export interface ReviewInterviewRescheduleInput {
  action: "approve" | "reject";
  to_slot_id?: string;
  review_remarks?: string;
}
