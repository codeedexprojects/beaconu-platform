export interface SidebarHintsBreakdown {
  pendingEnrollment: number;
  seatCancellations: number;
  courseSwitchRequests: number;
  supportTickets: number;
  documentSubmissionRequests: number;
  documentRequests: number;
}

export interface SidebarHintsDto {
  newApplications: number;
  assessmentEvaluationQueue: number;
  otherRequests: number;
  breakdown: SidebarHintsBreakdown;
}
