import type { PaginationMeta } from "./api";
import type { StatusHistoryEntry } from "./documents";

export type IncidentType = "verbal" | "physical" | "mental" | "cyber";

export type AntiRaggingComplaintStatus =
  | "submitted"
  | "acknowledged"
  | "investigating"
  | "resolved";

export interface IndividualInvolved {
  name: string;
  department: string | null;
  year: string | null;
  class: string | null;
}

export interface EvidenceAttachment {
  url: string;
  name: string | null;
  sizeBytes: number | null;
}

export interface AntiRaggingComplaintPartyStudent {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
}

export interface AntiRaggingComplaintAssignee {
  id: string;
  fullName: string;
}

export interface AntiRaggingComplaintItem {
  id: string;
  complaintNumber: string;
  collegeId: string;
  studentId: string;
  incidentType: IncidentType;
  subject: string;
  individualsInvolved: IndividualInvolved[];
  incidentDate: string;
  incidentTime: string | null;
  description: string;
  isAnonymous: boolean;
  attachments: EvidenceAttachment[];
  status: AntiRaggingComplaintStatus;
  statusHistory: StatusHistoryEntry[];
  assignedTo: string | null;
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
  student: AntiRaggingComplaintPartyStudent | null;
  assignee: AntiRaggingComplaintAssignee | null;
}

export interface AntiRaggingComplaintListResponse {
  complaints: AntiRaggingComplaintItem[];
  meta: PaginationMeta;
}

// Trimmed shape for the student's own report list — full detail lives
// behind the get-by-id endpoint.
export interface AntiRaggingComplaintSummary {
  id: string;
  complaintNumber: string;
  subject: string;
  incidentDate: string;
  status: AntiRaggingComplaintStatus;
}

export interface AntiRaggingComplaintSummaryListResponse {
  complaints: AntiRaggingComplaintSummary[];
  meta: PaginationMeta;
}

export interface IndividualInvolvedInput {
  name: string;
  department?: string;
  year?: string;
  class?: string;
}

export interface EvidenceAttachmentInput {
  url: string;
  name?: string;
  size_bytes?: number;
}

export interface CreateComplaintInput {
  college_id: string;
  incident_type: IncidentType;
  subject: string;
  individuals_involved: IndividualInvolvedInput[];
  incident_date: string;
  incident_time?: string;
  description: string;
  attachments?: EvidenceAttachmentInput[];
}

export interface ResolveComplaintInput {
  resolution: string;
}
