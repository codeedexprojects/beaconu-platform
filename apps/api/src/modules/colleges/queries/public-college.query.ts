import { prisma } from "@beaconu/db";

export class PublicCollegeQuery {
  static async getFilters(search?: string) {
    const stateRows = await prisma.college.findMany({
      where: {
        status: "active",
        state: {
          not: null,
          ...(search ? { contains: search, mode: "insensitive" } : {}),
        },
      },
      select: { state: true },
      distinct: ["state"],
      orderBy: { state: "asc" },
    });

    return {
      states: stateRows.map((r) => r.state as string),
    };
  }
}
