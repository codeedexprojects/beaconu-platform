export const QUERY_KEYS = {
  universities: ["universities"] as const,
  university: (id: string) => ["universities", id] as const,
  universityTypes: ["university-types"] as const,
  universityType: (id: string) => ["university-types", id] as const,
  academicTaxonomy: {
    streams: ["academic-taxonomy", "streams"] as const,
    disciplines: ["academic-taxonomy", "disciplines"] as const,
    studyLevels: ["academic-taxonomy", "study-levels"] as const,
    programTypes: ["academic-taxonomy", "program-types"] as const,
    courseMasters: ["academic-taxonomy", "courses"] as const,
  },
  adminProfiles: ["admin-profiles"] as const,
  pendingBlink: ["pending-blink-users"] as const,
  associateAdmins: ["associate-admins"] as const,
  platformRoles: ["platform-roles"] as const,
  platformPerms: ["platform-permissions"] as const,
  permissionRegistry: ["permission-registry"] as const,
  collegeLeads: ["college-leads"] as const,
  collegeLead: (id: string) => ["college-leads", id] as const,
  collegeLeadStats: ["college-leads-stats"] as const,
  adminBlogs: (params?: object) =>
    params ? ["admin-blogs", params] : (["admin-blogs"] as const),
  adminBlog: (id: string) => ["admin-blogs", id] as const,
  colleges: ["colleges"] as const,
  college: (id: string) => ["colleges", id] as const,
  collegeStats: ["colleges-stats"] as const,
  newsAlerts: (params?: object) =>
    params ? ["news-alerts", params] : (["news-alerts"] as const),
  newsAlert: (id: string) => ["news-alerts", id] as const,
  entranceExams: (params?: object) =>
    params ? ["entrance-exams", params] : (["entrance-exams"] as const),
  entranceExam: (id: string) => ["entrance-exams", id] as const,
  educationBoards: (params?: object) =>
    params ? ["education-boards", params] : (["education-boards"] as const),
  educationBoard: (id: string) => ["education-boards", id] as const,
  icons: (params?: object) =>
    params ? ["icons", params] : (["icons"] as const),
  icon: (id: string) => ["icons", id] as const,
  institutionGroup: (collegeId: string) =>
    ["institution-group", collegeId] as const,
  educationLoans: (params?: object) =>
    params ? ["education-loans", params] : (["education-loans"] as const),
  educationLoan: (id: string) => ["education-loans", id] as const,
  starterGuideVideos: (params?: object) =>
    params
      ? ["starter-guide-videos", params]
      : (["starter-guide-videos"] as const),
  starterGuideVideo: (id: string) => ["starter-guide-videos", id] as const,
  events: (params?: object) =>
    params ? ["events", params] : (["events"] as const),
  event: (id: string) => ["events", id] as const,
  eventRegistrations: (eventId: string, params?: object) =>
    params
      ? ["event-registrations", eventId, params]
      : (["event-registrations", eventId] as const),
  counsellorRequests: (params?: object) =>
    params
      ? ["counsellor-requests", params]
      : (["counsellor-requests"] as const),
  counsellorRequest: (id: string) => ["counsellor-requests", id] as const,
  counsellors: (params?: object) =>
    params ? ["counsellors", params] : (["counsellors"] as const),
  counsellorDetail: (id: string) => ["counsellors", id, "detail"] as const,
  counsellorWalletTransactions: (id: string, params?: object) =>
    params
      ? (["counsellors", id, "wallet-transactions", params] as const)
      : (["counsellors", id, "wallet-transactions"] as const),
  counsellorSlots: (
    id: string,
    status: "available" | "booked",
    params?: object,
  ) =>
    params
      ? (["counsellors", id, "slots", status, params] as const)
      : (["counsellors", id, "slots", status] as const),
  counsellorSessions: (id: string, params?: object) =>
    params
      ? (["counsellors", id, "sessions", params] as const)
      : (["counsellors", id, "sessions"] as const),
  platformConfig: ["platform-config"] as const,
  withdrawalRequests: (params?: object) =>
    params
      ? ["withdrawal-requests", params]
      : (["withdrawal-requests"] as const),
  refundRequests: (params?: object) =>
    params ? ["refund-requests", params] : (["refund-requests"] as const),
  students: (params?: object) =>
    params ? ["students", params] : (["students"] as const),
  student: (id: string) => ["students", id] as const,
} as const;
