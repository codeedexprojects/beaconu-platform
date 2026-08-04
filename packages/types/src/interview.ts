export type InterviewMode = "gmeet" | "on_campus";
export type InterviewSlotStatus = "active" | "cancelled";

export interface InterviewCampusLocation {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface InterviewSlotItem {
  id: string;
  collegeId: string;
  mode: InterviewMode;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  durationMins: number;
  meetingUrl: string | null;
  meetingId: string | null;
  meetingPasscode: string | null;
  campus: InterviewCampusLocation | null;
  venue: string | null;
  interviewerId: string | null;
  interviewerName: string | null;
  status: InterviewSlotStatus;
  createdAt: string;
}

export interface CreateInterviewSlotInput {
  mode: InterviewMode;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  duration_mins?: number;
  campus_id?: string;
  venue?: string;
  interviewer_id?: string;
}

export type UpdateInterviewSlotInput = Partial<CreateInterviewSlotInput>;

export interface ListAvailableInterviewSlotsQuery {
  college_id: string;
  mode?: InterviewMode;
  scheduled_date?: string;
}

export interface InterviewModeInstructions {
  heading: string | null;
  description: string | null;
  instructions: string[];
}

export interface InterviewSettingsItem {
  collegeId: string;
  allowGmeet: boolean;
  allowOnCampus: boolean;
  gmeet: InterviewModeInstructions;
  onCampus: InterviewModeInstructions;
  updatedAt: string;
}

export interface UpdateInterviewModeInstructionsInput {
  heading?: string;
  description?: string;
  instructions?: string[];
}

export interface UpdateInterviewSettingsInput {
  allow_gmeet?: boolean;
  allow_on_campus?: boolean;
  gmeet?: UpdateInterviewModeInstructionsInput;
  on_campus?: UpdateInterviewModeInstructionsInput;
}

export type InterviewBookingStatus = "booked" | "completed" | "cancelled";
export type InterviewOutcome = "recommended" | "not_recommended";

export interface InterviewBookingItem {
  id: string;
  applicationId: string;
  applicationNumber: string;
  courses: {
    applicationCourseId: string;
    courseName: string;
    status: string;
  }[];
  studentId: string;
  studentName: string;
  studentPhone: string | null;
  slot: InterviewSlotItem;
  instructions: InterviewModeInstructions;
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
  application_id: string;
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
