import { prisma } from "@beaconu/db";

export class UniversityTypeQuery {
  static async listActive() {
    return prisma.universityType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        sortOrder: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }
}
