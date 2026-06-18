import { prisma, Prisma } from "@beaconu/db";

const COUNSELLOR_SELECT = {
  id: true,
  counsellorCode: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  avatarUrl: true,
  counsellorType: true,
  status: true,
  rating: true,
  knownLanguages: true,
  sessionFee: true,
  profileMetadata: true,
  upiId: true,
  bankDetails: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class CounsellingRepository {
  static async findById(id: string) {
    return prisma.counsellor.findUnique({
      where: { id },
      select: {
        ...COUNSELLOR_SELECT,
        wallet: { select: { balance: true } },
      },
    });
  }

  static async findAllKnownLanguages(): Promise<string[]> {
    const rows = await prisma.counsellor.findMany({
      where: { status: "active", knownLanguages: { not: null } },
      select: { knownLanguages: true },
    });
    return rows.map((row) => row.knownLanguages as string);
  }

  static async findAll(
    filters: {
      counsellorType?: string;
      status?: string;
      language?: string;
    } = {},
  ) {
    return prisma.counsellor.findMany({
      where: {
        ...(filters.counsellorType
          ? { counsellorType: filters.counsellorType }
          : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.language
          ? {
              knownLanguages: {
                contains: filters.language,
                mode: "insensitive" as const,
              },
            }
          : {}),
      },
      select: COUNSELLOR_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async findActiveWithSlots(filters: {
    date?: Date;
    counsellorType?: string;
    language?: string;
    page: number;
    limit: number;
  }) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {
      status: "active",
      ...(filters.counsellorType
        ? { counsellorType: filters.counsellorType }
        : {}),
      ...(filters.language
        ? {
            knownLanguages: {
              contains: filters.language,
              mode: "insensitive" as const,
            },
          }
        : {}),
      ...(filters.date
        ? {
            availability: {
              some: { isBooked: false, availableDate: filters.date },
            },
          }
        : {}),
    };

    const [counsellors, total] = await Promise.all([
      prisma.counsellor.findMany({
        where,
        select: COUNSELLOR_SELECT,
        orderBy: { rating: "desc" },
        skip,
        take: limit,
      }),
      prisma.counsellor.count({ where }),
    ]);

    return { counsellors, total };
  }

  static async updateById(
    id: string,
    data: {
      fullName?: string;
      phoneNumber?: string;
      avatarUrl?: string;
      counsellorType?: string;
      knownLanguages?: string;
      sessionFee?: number;
      profileMetadata?: Prisma.InputJsonValue;
      upiId?: string;
      bankDetails?: Prisma.InputJsonValue;
    },
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
