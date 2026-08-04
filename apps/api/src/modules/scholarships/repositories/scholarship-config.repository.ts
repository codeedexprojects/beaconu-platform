import { prisma } from "@beaconu/db";

const CONFIG_SELECT = {
  id: true,
  collegeId: true,
  name: true,
  scholarshipType: true,
  discountType: true,
  discountValue: true,
  requiredDocuments: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface ScholarshipConfigCreateData {
  name: string;
  scholarshipType: string;
  discountType: string;
  discountValue: number;
  requiredDocuments: string[];
}

export class ScholarshipConfigRepository {
  static async create(collegeId: string, data: ScholarshipConfigCreateData) {
    return prisma.scholarshipConfig.create({
      data: {
        collegeId,
        name: data.name,
        scholarshipType: data.scholarshipType,
        discountType: data.discountType,
        discountValue: data.discountValue,
        requiredDocuments: data.requiredDocuments,
        eligibility: {},
      },
      select: CONFIG_SELECT,
    });
  }

  static async findById(id: string, collegeId: string) {
    return prisma.scholarshipConfig.findFirst({
      where: { id, collegeId },
      select: CONFIG_SELECT,
    });
  }

  static async listByCollege(collegeId: string, activeOnly = false) {
    return prisma.scholarshipConfig.findMany({
      where: { collegeId, ...(activeOnly && { isActive: true }) },
      select: CONFIG_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async update(
    id: string,
    data: Partial<ScholarshipConfigCreateData> & { isActive?: boolean },
  ) {
    return prisma.scholarshipConfig.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.scholarshipType !== undefined && {
          scholarshipType: data.scholarshipType,
        }),
        ...(data.discountType !== undefined && {
          discountType: data.discountType,
        }),
        ...(data.discountValue !== undefined && {
          discountValue: data.discountValue,
        }),
        ...(data.requiredDocuments !== undefined && {
          requiredDocuments: data.requiredDocuments,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: CONFIG_SELECT,
    });
  }
}
