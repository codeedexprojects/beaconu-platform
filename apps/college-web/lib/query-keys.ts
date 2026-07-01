export const QUERY_KEYS = {
  campusVisits: (filters?: object) =>
    filters ? ["campus-visits", filters] : ["campus-visits"],
  campusVisit: (id: string) => ["campus-visits", id],
  ambassadors: (collegeId: string) => ["ambassadors", collegeId],
} as const;
