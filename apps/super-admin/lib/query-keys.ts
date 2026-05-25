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
  institutionGroup: (collegeId: string) =>
    ["institution-group", collegeId] as const,
  educationLoans: (params?: object) =>
    params ? ["education-loans", params] : (["education-loans"] as const),
  educationLoan: (id: string) => ["education-loans", id] as const,
} as const;
