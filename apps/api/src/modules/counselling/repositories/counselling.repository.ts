import { prisma } from "@beaconu/db";

const COUNSELLOR_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  avatarUrl: true,
  counsellorType: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

export class CounsellingRepository {
  static async findById(id: string) {
    return prisma.counsellor.findUnique({
      where: { id },
      select: COUNSELLOR_SELECT,
    });
  }

  static async findAll(
    filters: { counsellorType?: string; status?: string } = {},
  ) {
    return prisma.counsellor.findMany({
      where: {
        ...(filters.counsellorType
          ? { counsellorType: filters.counsellorType }
          : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      select: COUNSELLOR_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateById(
    id: string,
    data: { fullName?: string; phoneNumber?: string; avatarUrl?: string },
  ) {
    return prisma.counsellor.update({
      where: { id },
      data,
      select: COUNSELLOR_SELECT,
    });
  }

  static async updateStatus(id: string, status: string) {
    return prisma.counsellor.update({
      where: { id },
      data: { status },
      select: COUNSELLOR_SELECT,
    });
  }
}
