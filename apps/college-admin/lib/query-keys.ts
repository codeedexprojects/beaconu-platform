export const QUERY_KEYS = {
  profile: ["college-profile"] as const,
  campuses: ["college-campuses"] as const,
  courses: ["college-courses"] as const,
  coursesMinimal: ["college-courses-minimal"] as const,
  lookupsStreams: ["lookups", "streams"] as const,
  lookupsStudyLevels: ["lookups", "study-levels"] as const,
  lookupsProgramTypes: ["lookups", "program-types"] as const,
  lookupsUniversities: ["lookups", "universities"] as const,
  setupTokenValidation: (token: string) =>
    ["auth", "setup-token", token] as const,
  publicColleges: ["public-colleges"] as const,
  publicCollegeBySlug: (slug: string) => ["public-colleges", slug] as const,
  permissions: ["college-permissions"] as const,
  roles: ["college-roles"] as const,
  staff: ["college-staff"] as const,
  hostels: ["college-hostels"] as const,
  libraries: ["college-libraries"] as const,
  quotas: ["college-quotas"] as const,
  quotaUsage: (id: string) => ["college-quota-usage", id] as const,
  courseQuotas: (courseId: string) => ["course-quotas", courseId] as const,
  feeStructures: (courseId: string) => ["fee-structures", courseId] as const,
  lookupsDepartments: ["lookups", "departments"] as const,
  icons: (search?: string) =>
    search ? (["icons", search] as const) : (["icons"] as const),
  applications: (filters?: object) =>
    filters ? ["college-applications", filters] : ["college-applications"],
  application: (id: string) => ["college-applications", id] as const,
  interviewSlots: (filters?: object) =>
    filters ? ["interview-slots", filters] : ["interview-slots"],
  interviewSettings: ["interview-settings"] as const,
  interviewBookings: (status?: string) =>
    status ? ["interview-bookings", status] : ["interview-bookings"],
  interviewReschedules: (status?: string) =>
    status ? ["interview-reschedules", status] : ["interview-reschedules"],
  scholarshipConfigs: ["scholarship-configs"] as const,
  scholarshipApplications: (status?: string) =>
    status
      ? ["scholarship-applications", status]
      : ["scholarship-applications"],
  commutes: ["college-commutes"] as const,
  commuteEnrollments: (filters?: unknown) =>
    filters
      ? (["commute-enrollments", filters] as const)
      : (["commute-enrollments"] as const),
  commuteEnrollment: (id: string) => ["commute-enrollment", id] as const,
  hostelEnrollments: (filters?: unknown) =>
    filters
      ? (["hostel-enrollments", filters] as const)
      : (["hostel-enrollments"] as const),
  hostelEnrollment: (id: string) => ["hostel-enrollment", id] as const,
  supportTickets: (filters?: unknown) =>
    filters
      ? (["support-tickets", filters] as const)
      : (["support-tickets"] as const),
  supportTicket: (id: string) => ["support-ticket", id] as const,
  notices: (filters?: unknown) =>
    filters ? (["notices", filters] as const) : (["notices"] as const),
  notice: (id: string) => ["notice", id] as const,
  institutionGroup: ["college-institution-group"] as const,
  ambassadors: ["college-ambassadors"] as const,
  ambassador: (id: string) => ["college-ambassadors", id] as const,
  campusVisits: (filters?: object) =>
    filters ? ["college-campus-visits", filters] : ["college-campus-visits"],
  campusVisit: (id: string) => ["college-campus-visits", id] as const,
  campusVisitStats: ["college-campus-visit-stats"] as const,
  campusVisitAvailability: ["college-campus-visit-availability"] as const,
  submissionRequests: (filters?: object) =>
    filters
      ? ["college-submission-requests", filters]
      : ["college-submission-requests"],
  documentRequests: (filters?: object) =>
    filters
      ? ["college-document-requests", filters]
      : ["college-document-requests"],
  documentTemplates: (includeInactive?: boolean) =>
    ["college-document-templates", includeInactive ?? false] as const,
  admissionCycles: (filters?: object) =>
    filters
      ? ["college-admission-cycles", filters]
      : ["college-admission-cycles"],
  admissionCycleCourses: (admissionCycleId: string) =>
    ["college-admission-cycle-courses", admissionCycleId] as const,
  courseQuotaSeats: (admissionCycleId: string, courseId: string) =>
    ["college-course-quota-seats", admissionCycleId, courseId] as const,
  seatPools: (admissionCycleId: string) =>
    ["college-seat-pools", admissionCycleId] as const,
  documentRequirements: (admissionCycleId: string) =>
    ["college-document-requirements", admissionCycleId] as const,
  assessmentSections: ["college-assessment-sections"] as const,
  assessmentTemplates: ["college-assessment-templates"] as const,
  assessmentTemplate: (id: string) =>
    ["college-assessment-templates", id] as const,
  assessmentPapers: (templateId: string) =>
    ["college-assessment-papers", templateId] as const,
  assessmentPaper: (id: string) => ["college-assessment-paper", id] as const,
  assessmentSlots: (templateId: string) =>
    ["college-assessment-slots", templateId] as const,
  assessmentQuestionTypes: (slug: string) =>
    ["college-assessment-question-types", slug] as const,
  assessmentQuestions: (slug: string, filters?: object) =>
    filters
      ? ["college-assessment-questions", slug, filters]
      : ["college-assessment-questions", slug],
  evaluationQueue: (status?: string[]) =>
    status?.length
      ? (["college-evaluation-queue", status] as const)
      : (["college-evaluation-queue"] as const),
  evaluationDetail: (attemptId: string) =>
    ["college-evaluation-detail", attemptId] as const,
  antiRaggingComplaints: (filters?: object) =>
    filters
      ? ["college-anti-ragging-complaints", filters]
      : ["college-anti-ragging-complaints"],
  mediaKits: (filters?: object) =>
    filters ? ["college-media-kit", filters] : ["college-media-kit"],
  mediaKit: (id: string) => ["college-media-kit", id] as const,
} as const;
