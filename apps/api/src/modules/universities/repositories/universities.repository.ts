import { prisma } from "@beaconu/db";

const UNIVERSITY_SELECT = {
  id: true,
  universityTypeId: true,
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
} as const;

export class UniversityRepository {
  static async findById(id: string) {
    return prisma.university.findUnique({
      where: { id },
      select: UNIVERSITY_SELECT,
    });
  }

  static async findBySlug(slug: string) {
    return prisma.university.findUnique({
      where: { slug },
      select: UNIVERSITY_SELECT,
    });
  }

  static async create(data: {
    universityTypeId: string;
    name: string;
    slug: string;
    state?: string;
    city?: string;
    accreditation?: string;
    governanceDetails?: string;
    logoUrl?: string;
    metadata?: object;
  }) {
    return prisma.university.create({
      data,
      select: UNIVERSITY_SELECT,
    });
  }

  static async updateById(
    id: string,
    data: {
      universityTypeId?: string;
      name?: string;
      slug?: string;
      state?: string;
      city?: string;
      accreditation?: string;
      governanceDetails?: string;
      logoUrl?: string;
      status?: string;
      metadata?: object;
    },
  ) {
    return prisma.university.update({
      where: { id },
      data,
      select: UNIVERSITY_SELECT,
    });
  }
}
