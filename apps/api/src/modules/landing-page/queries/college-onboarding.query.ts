// Query helpers for college onboarding requests
// These can be used for complex query building if needed in the future.

export const collegeOnboardingQueries = {
  buildStatusFilter: (status?: string) => (status ? { status } : {}),

  buildSearchFilter: (search?: string) =>
    search
      ? {
          OR: [
            { collegeName: { contains: search, mode: "insensitive" as const } },
            {
              contactPersonName: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              contactEmail: { contains: search, mode: "insensitive" as const },
            },
            { city: { contains: search, mode: "insensitive" as const } },
            { state: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {},
};
