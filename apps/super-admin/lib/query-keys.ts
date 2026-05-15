export const QUERY_KEYS = {
  universities: ["universities"] as const,
  university: (id: string) => ["universities", id] as const,
  universityTypes: ["university-types"] as const,
  universityType: (id: string) => ["university-types", id] as const,
  adminProfiles: ["admin-profiles"] as const,
  pendingBlink: ["pending-blink-users"] as const,
  associateAdmins: ["associate-admins"] as const,
  platformRoles: ["platform-roles"] as const,
  platformPerms: ["platform-permissions"] as const,
  collegeLeads: ["college-leads"] as const,
  collegeLead: (id: string) => ["college-leads", id] as const,
  collegeLeadStats: ["college-leads-stats"] as const,
  adminBlogs: (params?: object) =>
    params ? ["admin-blogs", params] : (["admin-blogs"] as const),
  adminBlog: (id: string) => ["admin-blogs", id] as const,
} as const;
