import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { ListUniversitiesQuery } from "../validators/universities.validator";

const UNIVERSITY_WITH_TYPE_SELECT = {
  id: true,
  name: true,
  slug: true,
  state: true,
  city: true,
  accreditation: true,
  governanceDetails: true,
  logoUrl: true,
  status: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  universityType: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} as const;

export class UniversityQuery {
  static async listAll(filters: ListUniversitiesQuery) {
    return prisma.university.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.university_type_id
          ? { universityTypeId: filters.university_type_id }
          : {}),
        ...(filters.state ? { state: filters.state } : {}),
        ...(filters.search
          ? { name: { contains: filters.search, mode: "insensitive" } }
          : {}),
      },
      select: UNIVERSITY_WITH_TYPE_SELECT,
      orderBy: [{ name: "asc" }],
    });
  }

  static async listActive(filters: Omit<ListUniversitiesQuery, "status">) {
    return prisma.university.findMany({
      where: {
        status: "active",
        ...(filters.university_type_id
          ? { universityTypeId: filters.university_type_id }
          : {}),
        ...(filters.state ? { state: filters.state } : {}),
        ...(filters.search
          ? { name: { contains: filters.search, mode: "insensitive" } }
          : {}),
      },
      select: UNIVERSITY_WITH_TYPE_SELECT,
      orderBy: [{ name: "asc" }],
    });
  }

  static async getById(id: string) {
    const university = await prisma.university.findUnique({
      where: { id },
      select: UNIVERSITY_WITH_TYPE_SELECT,
    });
    if (!university) throw new NotFoundError("University not found");
    return university;
  }

  static async getActiveById(id: string) {
    const university = await prisma.university.findUnique({
      where: { id, status: "active" },
      select: UNIVERSITY_WITH_TYPE_SELECT,
    });
    if (!university) throw new NotFoundError("University not found");
    return university;
  }
}
