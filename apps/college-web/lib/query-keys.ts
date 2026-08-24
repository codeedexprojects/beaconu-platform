export const QUERY_KEYS = {
  publicCollegeBySlug: (slug: string) => ["public-colleges", slug] as const,
  campusAmbassadors: (collegeId: string) =>
    ["campus-ambassadors", collegeId] as const,
  campusVisitAvailability: (collegeId: string) =>
    ["campus-visit-availability", collegeId] as const,
  myCampusVisits: (collegeId: string) =>
    ["my-campus-visits", collegeId] as const,
  myTickets: (filters?: unknown) =>
    filters ? (["my-tickets", filters] as const) : (["my-tickets"] as const),
  ticketDetail: (id: string) => ["ticket-detail", id] as const,
  admissionCycles: (collegeId: string) =>
    ["admission-cycles", collegeId] as const,
  admissionCycle: (id: string) => ["admission-cycle", id] as const,
  courseCatalogue: (cycleId: string, search?: string) =>
    search
      ? (["course-catalogue", cycleId, search] as const)
      : (["course-catalogue", cycleId] as const),
  myApplication: (applicationId: string) =>
    ["my-application", applicationId] as const,
  myApplications: ["my-applications"] as const,
  applicationStatus: (applicationId: string) =>
    ["application-status", applicationId] as const,
  applicationPaymentSummary: (applicationId: string) =>
    ["application-payment-summary", applicationId] as const,
  applicationFormDetails: (applicationId: string, section: string) =>
    ["application-form-details", applicationId, section] as const,
  requiredDocuments: (applicationId: string) =>
    ["required-documents", applicationId] as const,
  uploadedDocuments: (applicationId: string) =>
    ["uploaded-documents", applicationId] as const,
  countries: ["countries"] as const,
  statesOfCountry: (countryCode: string) =>
    ["states-of-country", countryCode] as const,
  indiaStates: ["india-states"] as const,
  mediums: ["mediums"] as const,
  educationBoards: (grade: "10th" | "12th", search?: string) =>
    search
      ? (["education-boards", grade, search] as const)
      : (["education-boards", grade] as const),
  educationBoardDetail: (id: string, course?: string) =>
    course
      ? (["education-board-detail", id, course] as const)
      : (["education-board-detail", id] as const),
  assessmentStart: (applicationId: string) =>
    ["assessment-start", applicationId] as const,
  trialPaper: (templateId: string) => ["trial-paper", templateId] as const,
  myAttempt: (attemptId: string) => ["my-attempt", attemptId] as const,
  attemptSections: (attemptId: string) =>
    ["attempt-sections", attemptId] as const,
  attemptSectionQuestion: (
    attemptId: string,
    sectionId: string,
    questionOrder: number,
  ) =>
    ["attempt-section-question", attemptId, sectionId, questionOrder] as const,
  attemptOverview: (attemptId: string, sectionId: string) =>
    ["attempt-overview", attemptId, sectionId] as const,
  interviewSlots: (collegeId: string, filters?: unknown) =>
    filters
      ? (["interview-slots", collegeId, filters] as const)
      : (["interview-slots", collegeId] as const),
  myInterviewBooking: (applicationId: string) =>
    ["my-interview-booking", applicationId] as const,
  offlineTokenPaymentStatus: (applicationCourseId: string) =>
    ["offline-token-payment-status", applicationCourseId] as const,
  scholarshipConfigs: (collegeId: string) =>
    ["scholarship-configs", collegeId] as const,
} as const;
