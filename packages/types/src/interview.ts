// "telephonic" was removed entirely — Google Meet and On Campus only, each
// independently toggleable per college via InterviewSettingsItem.
export type InterviewMode = "gmeet" | "on_campus";
export type InterviewSlotStatus = "active" | "cancelled";

/** Structured campus location for "on_campus" slots — pulled from the
 * college's actual Campus record, not free text. latitude/longitude are
 * null if the campus was never geo-tagged ("if exist", per the ask). */
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
  // Always 1 — no longer admin-configurable (see CreateInterviewSlotInput's
  // doc comment). Kept on the read DTO only for display/booking-count use.
  maxCapacity: number;
  bookedCount: number;
  meetingUrl: string | null;
  meetingId: string | null;
  meetingPasscode: string | null;
  // "on_campus" only — null for "gmeet" slots, and null for "on_campus"
  // slots created before a campus was selected (venue-only, legacy).
  campus: InterviewCampusLocation | null;
  venue: string | null;
  interviewerId: string | null;
  interviewerName: string | null;
  status: InterviewSlotStatus;
  createdAt: string;
}

// No manual meeting_url/meeting_id/meeting_passcode — for "gmeet" mode
// these are always auto-generated via the Google Meet integration
// (@/shared/lib/google-meet), never entered by hand. No max_capacity
// either — every slot is a fixed 1-on-1 booking now, not admin-configurable
// (InterviewSlotItem.maxCapacity is always 1, enforced server-side).
// campus_id is meaningful only for "on_campus" mode — must belong to the
// same college as the slot.
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

/** Query filters for the student-facing available-slots list —
 * "date wise" (scheduled_date) and "type" (mode). */
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

/** One shared pair of blocks per college, not per slot — separate
 * heading/description/instructions for online (Google Meet) vs offline
 * (On Campus) interviews, since the two need genuinely different guidance,
 * plus which modes are currently open for new slot creation. */
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
  // One shared booking per whole Application (not per course) — an
  // Application can carry several courses via "Add Course". Each course
  // still has its own independent pipeline status (e.g. one could be
  // interview_completed while another hasn't reached that stage yet), so
  // shortlisting stays a distinct, per-course staff action taken after
  // this shared interview.
  applicationId: string;
  applicationNumber: string;
  courses: {
    applicationCourseId: string;
    courseName: string;
    status: string;
  }[];
  studentId: string;
  studentName: string;
  /** The student's own phone number, for the interviewer's reference. */
  studentPhone: string | null;
  slot: InterviewSlotItem;
  /** The college's instructions for whichever mode this booking's slot is
   * — gmeet's block if slot.mode === "gmeet", onCampus's otherwise. Baked
   * in here so "get my booking" is fully self-contained (no separate
   * settings call needed post-booking). */
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
