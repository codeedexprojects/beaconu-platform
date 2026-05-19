export const QUERY_KEYS = {
  profile: ["college-profile"] as const,
  campuses: ["college-campuses"] as const,
  courses: ["college-courses"] as const,
  lookupsStreams: ["lookups", "streams"] as const,
  lookupsStudyLevels: ["lookups", "study-levels"] as const,
  lookupsProgramTypes: ["lookups", "program-types"] as const,
  lookupsUniversities: ["lookups", "universities"] as const,
  setupTokenValidation: (token: string) =>
    ["auth", "setup-token", token] as const,
  publicCollegeBySlug: (slug: string) => ["public-colleges", slug] as const,
} as const;
