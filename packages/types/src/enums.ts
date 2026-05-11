export enum ApplicationStatus {
  Draft = "draft",
  Submitted = "submitted",
  UnderReview = "under_review",
  EligibilityCheck = "eligibility_check",
  AssessmentPending = "assessment_pending",
  AssessmentCompleted = "assessment_completed",
  InterviewPending = "interview_pending",
  InterviewCompleted = "interview_completed",
  Shortlisted = "shortlisted",
  OfferIssued = "offer_issued",
  TokenPaid = "token_paid",
  Enrolled = "enrolled",
  Rejected = "rejected",
  DroppedOut = "dropped_out",
  Deferred = "deferred",
}

export enum TransactionStatus {
  Pending = "pending",
  Completed = "completed",
  Failed = "failed",
  Rejected = "rejected",
  Refunded = "refunded",
}

export enum AssessmentAttemptStatus {
  NotStarted = "not_started",
  InProgress = "in_progress",
  Completed = "completed",
  AutoSubmitted = "auto_submitted",
  Terminated = "terminated",
  UnderEvaluation = "under_evaluation",
  Evaluated = "evaluated",
  ResultPublished = "result_published",
}

export enum EntityStatus {
  Active = "active",
  Inactive = "inactive",
  Archived = "archived",
}

export enum DocumentRequestStatus {
  Submitted = "submitted",
  Processing = "processing",
  AwaitingApproval = "awaiting_approval",
  Approved = "approved",
  Rejected = "rejected",
  Issued = "issued",
  Collected = "collected",
}

export enum SupportTicketStatus {
  InProgress = "in_progress",
  AwaitingResponse = "awaiting_response",
  Resolved = "resolved",
  Closed = "closed",
  Reopened = "reopened",
}

export enum ReferralStatus {
  Submitted = "submitted",
  Rejected = "rejected",
  Confirmed = "confirmed",
  DroppedOut = "dropped_out",
}

export enum CommissionStatus {
  Pending = "pending",
  Credited = "credited",
  Cancelled = "cancelled",
}
