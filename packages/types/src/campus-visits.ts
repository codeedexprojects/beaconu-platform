import type { PaginationMeta } from "./api";

export type CampusVisitStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "reassigned"
  | "rejected";

export interface CampusVisitGuest {
  name: string;
  relation: string;
}

export interface CampusVisitAmbassador {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  campusCode: string | null;
}

export interface CampusVisit {
  id: string;
  collegeId: string;
  studentId: string;
  ambassador: CampusVisitAmbassador | null;
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
  visitNotes: string | null;
  visitRating: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampusVisitInput {
  college_id: string;
  ambassador_id?: string;
  full_name: string;
  email: string;
  phone_number: string;
  course_interest?: string;
  additional_visitors_count?: number;
  guests?: CampusVisitGuest[];
  reason_for_visit: string;
  proposed_date: string;
  proposed_time: string;
}

export interface RescheduleCampusVisitInput {
  proposed_date: string;
  proposed_time: string;
}

export interface CancelCampusVisitInput {
  cancellation_reason: string;
}

export interface RejectCampusVisitInput {
  rejection_reason: string;
}

export interface ReassignCampusVisitInput {
  ambassador_id: string;
  reassignment_reason?: string;
}

export interface CampusVisitListItem {
  id: string;
  studentName: string;
  email: string | null;
  phoneNumber: string | null;
  ambassador: CampusVisitAmbassador | null;
  proposedDate: string;
  proposedTime: string;
  status: CampusVisitStatus;
  reasonForVisit: string | null;
  additionalVisitorsCount: number;
  createdAt: string;
}

export interface CampusVisitListResponse {
  visits: CampusVisitListItem[];
  meta: PaginationMeta;
}

export interface AmbassadorOption {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  campusCode: string | null;
  ambassadorType: string | null;
}
