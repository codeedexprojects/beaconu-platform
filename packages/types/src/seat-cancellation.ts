export type SeatCancellationStatus = "pending" | "approved" | "rejected";

export type RefundStatus =
  | "not_applicable"
  | "pending"
  | "processed"
  | "denied";

export type SeatCancellationCaseType = "A" | "B" | "C";
export type SeatCancellationCounselingOutcome = "transfer" | "termination";
export type SeatCancellationRefundMethod = "percentage" | "fixed";

export interface SeatCancellationRequest {
  id: string;
  applicationCourseId: string;
  studentId: string;
  studentName: string | null;
  studentEmail: string | null;
  courseName: string;
  courseCode: string;
  collegeId: string;
  reason: string;
  supportingDocUrls: string[];
  status: SeatCancellationStatus;
  refundAmount: string | null;
  refundStatus: RefundStatus | null;
  processedBy: string | null;
  remarks: string | null;
  requestedAt: string;
  processedAt: string | null;
  currentPhase: number;
  caseType: SeatCancellationCaseType | null;
}

export interface SeatCancellationPhaseLogItem {
  id: string;
  phase: number;
  action: string;
  performedByName: string;
  createdAt: string;
}

export interface SeatCancellationCaseDetail extends SeatCancellationRequest {
  effectiveDate: string | null;
  lastSemester: string | null;
  counselorId: string | null;
  counselorName: string | null;
  scheduledAt: string | null;
  counselingCompletedAt: string | null;
  counselingNotes: string | null;
  counselingOutcome: SeatCancellationCounselingOutcome | null;
  suggestedCaseType: SeatCancellationCaseType | null;
  refundCalculationMethod: SeatCancellationRefundMethod | null;
  refundCalculationValue: string | null;
  penaltyAmount: string | null;
  penaltyPaidAt: string | null;
  settledAt: string | null;
  refundTransactionRef: string | null;
  refundPaymentMethod: string | null;
  refundProcessedAt: string | null;
  documentsHandedOverAt: string | null;
  phaseLogs: SeatCancellationPhaseLogItem[];
}

export interface RequestSeatCancellationInput {
  application_course_id: string;
  reason: string;
  supporting_doc_urls?: string[];
}

export interface ReviewSeatCancellationInput {
  decision: "approve" | "reject";
  remarks?: string;
  refund_amount?: number;
  refund_status?: RefundStatus;
}

export interface SubmitSeatCancellationInitiationInput {
  effective_date: string;
  last_semester: string;
}

export interface ScheduleSeatCancellationCounselingInput {
  counselor_id: string;
  scheduled_at: string;
}

export interface SubmitSeatCancellationCounselingOutcomeInput {
  notes?: string;
  outcome: SeatCancellationCounselingOutcome;
}

export interface SubmitSeatCancellationSettlementInput {
  case_type: SeatCancellationCaseType;
  penalty_amount?: number;
  refund_calculation_method?: SeatCancellationRefundMethod;
  refund_calculation_value?: number;
}

export interface FinalizeSeatCancellationClearanceInput {
  refund_transaction_ref?: string;
  refund_payment_method?: string;
}

export interface SeatCancellationListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SeatCancellationListResponse {
  requests: SeatCancellationRequest[];
  meta: SeatCancellationListMeta;
}
