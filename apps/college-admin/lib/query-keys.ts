export const QUERY_KEYS = {
  profile: ["college-profile"] as const,
  campuses: ["college-campuses"] as const,
  courses: ["college-courses"] as const,
  lookups: {
    streams: ["lookups-streams"] as const,
    studyLevels: ["lookups-study-levels"] as const,
    programTypes: ["lookups-program-types"] as const,
    universities: ["lookups-universities"] as const,
  },
} as const;
