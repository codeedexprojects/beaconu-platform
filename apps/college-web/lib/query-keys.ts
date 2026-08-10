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
} as const;
