import type { PaginationMeta } from "./api";

export type CampusVisitStatus =
  | "pending"
  | "arrived"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "reassigned";

export interface CampusVisitGuest {
  name: string;
  relation: string;
}

export interface CampusVisitAmbassadorContact {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  campusCode: string | null;
}

export interface CampusVisitCollegeLocation {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  pinCode: string | null;
}

export interface BookCampusVisitResponse {
  id: string;
  ambassador: CampusVisitAmbassadorContact | null;
  college: CampusVisitCollegeLocation;
}

export interface CampusVisit {
  id: string;
  collegeId: string;
  studentId: string;
  ambassador: CampusVisitAmbassadorContact | null;
  studentName: string;
  email: string | null;
  phoneNumber: string | null;
  courseInterest: string | null;
  additionalVisitorsCount: number;
  guests: CampusVisitGuest[] | null;
  reasonForVisit: string | null;
  proposedDate: string;
  proposedTime: string;
  status: CampusVisitStatus;
  cancellationReason: string | null;
  rejectionReason: string | null;
  reassignmentReason: string | null;
  previousProposedDate: string | null;
  previousProposedTime: string | null;
  rescheduledAt: string | null;
  arrivedAt: string | null;
  visitNotes: string | null;
  visitRating: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampusVisitInput {
  college_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  course_interest?: string;
  additional_visitors_count?: number;
  guests?: CampusVisitGuest[];
  reason_for_visit: string;
  proposed_date: string;
}

export interface RescheduleCampusVisitInput {
  proposed_date: string;
}

export interface CancelCampusVisitInput {
  cancellation_reason: string;
}

export interface ReassignCampusVisitInput {
  ambassador_id: string;
  reassignment_reason?: string;
}

export interface CampusVisitListItem {
  id: string;
  collegeId: string;
  college: CampusVisitCollegeLocation;
  studentName: string;
  email: string | null;
  phoneNumber: string | null;
  ambassador: CampusVisitAmbassadorContact | null;
  proposedDate: string;
  proposedTime: string;
  status: CampusVisitStatus;
  reasonForVisit: string | null;
  additionalVisitorsCount: number;
  cancellationReason: string | null;
  createdAt: string;
}

export interface CampusVisitListResponse {
  visits: CampusVisitListItem[];
  meta: PaginationMeta;
}

export interface CampusVisitStats {
  today: number;
  pending: number;
  confirmed: number;
}

export interface AmbassadorOption {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  campusCode: string | null;
  ambassadorType: string | null;
}

export type WeekdayName =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export interface CampusVisitAvailabilityEntry {
  id: string | null;
  collegeId: string;
  weekday: WeekdayName;
  time: string | null;
  maxCapacity: number;
  isOff: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UpsertCampusVisitAvailabilityInput {
  weekday: number;
  time?: string;
  max_capacity?: number;
  is_off?: boolean;
}
